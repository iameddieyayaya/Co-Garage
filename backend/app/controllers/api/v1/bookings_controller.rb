module Api
  module V1
    class BookingsController < ApplicationController
      skip_before_action :authenticate_request, only: [:create]

      def create
        bay = Bay.find_by(id: booking_params[:bay_id])
        return render json: { error: "Bay not found" }, status: :not_found unless bay
        return render json: { error: "Bay is not available" }, status: :unprocessable_content unless bay.available?

        start_time, end_time, day_factor = build_times(
          rental_date: booking_params[:rental_date],
          duration: booking_params[:duration],
          slot: booking_params[:slot]
        )

        if bay.bookings.where("start_time < ? AND end_time > ?", end_time, start_time).exists?
          return render json: { error: "Bay is already booked for that time" }, status: :unprocessable_content
        end

        booking = nil

        ActiveRecord::Base.transaction do
          booking = bay.bookings.new(
            user_id: nil,
            guest_name: booking_params[:guest_name],
            guest_email: booking_params[:guest_email],
            start_time: start_time,
            end_time: end_time,
            total_price: calculate_total(bay: bay, day_factor: day_factor, tools: booking_params[:tools])
          )

          booking.save!

          Array(booking_params[:tools]).each do |tool_entry|
            tool_id = tool_entry[:tool_id] || tool_entry["tool_id"]
            quantity = (tool_entry[:quantity] || tool_entry["quantity"]).to_i
            next if tool_id.blank?

            if quantity <= 0
              raise ActiveRecord::Rollback, "Invalid tool quantity"
            end

            tool = Tool.find_by(id: tool_id)
            raise ActiveRecord::Rollback, "Tool not found" unless tool
            raise ActiveRecord::Rollback, "Tool not available" unless tool.available?
            raise ActiveRecord::Rollback, "Tool must belong to the same shop" unless tool.shop_id == bay.shop_id

            booking.booking_tools.create!(tool: tool, quantity: quantity)
          end
        rescue ActiveRecord::RecordInvalid => e
          return render json: { errors: e.record.errors.full_messages }, status: :unprocessable_content
        rescue ActiveRecord::Rollback => e
          return render json: { error: e.message }, status: :unprocessable_content
        end

        render json: booking.as_json(include: { booking_tools: { include: { tool: { only: [:id, :name, :description, :day_rate] } }, only: [:quantity] } }),
               status: :created
      rescue ArgumentError => e
        render json: { error: e.message }, status: :unprocessable_content
      end

      private

      def booking_params
        params.require(:booking).permit(
          :bay_id,
          :guest_name,
          :guest_email,
          :rental_date,
          :duration,
          :slot,
          tools: [:tool_id, :quantity]
        )
      end

      def build_times(rental_date:, duration:, slot:)
        date = Date.iso8601(rental_date.to_s)
        duration = duration.to_s

        case duration
        when "full"
          start_time = Time.zone.local(date.year, date.month, date.day, 9, 0, 0)
          end_time = Time.zone.local(date.year, date.month, date.day, 17, 0, 0)
          [start_time, end_time, BigDecimal("1.0")]
        when "half"
          slot = slot.to_s
          hour = slot == "afternoon" ? 13 : 9
          start_time = Time.zone.local(date.year, date.month, date.day, hour, 0, 0)
          end_time = start_time + 4.hours
          [start_time, end_time, BigDecimal("0.5")]
        else
          raise ArgumentError, "duration must be 'full' or 'half'"
        end
      end

      def calculate_total(bay:, day_factor:, tools:)
        bay_hourly = bay.hourly_rate.to_d
        bay_hours = day_factor == BigDecimal("1.0") ? 8 : 4
        total = bay_hourly * bay_hours

        Array(tools).each do |tool_entry|
          tool_id = tool_entry[:tool_id] || tool_entry["tool_id"]
          quantity = (tool_entry[:quantity] || tool_entry["quantity"]).to_i
          next if tool_id.blank?
          next if quantity <= 0

          tool = Tool.find_by(id: tool_id)
          next unless tool

          total += tool.day_rate.to_d * day_factor * quantity
        end

        total
      end
    end
  end
end

