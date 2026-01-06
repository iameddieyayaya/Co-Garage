module Api
  module V1
    class BookingsController < ApplicationController
      skip_before_action :authenticate_request, only: [:create]

      def index
        shop = current_user.shop
        return render json: { error: "No shop found for this user" }, status: :unprocessable_content unless shop

        bookings = Booking
          .includes(:booking_tools, :tools, :bay)
          .joins(:bay)
          .where(bays: { shop_id: shop.id })
          .order(created_at: :desc)

        render json: bookings.as_json(
          include: {
            bay: { only: [:id, :description, :hourly_rate] },
            booking_tools: {
              include: { tool: { only: [:id, :name, :description, :day_rate] } },
              only: [:quantity]
            }
          }
        ), status: :ok
      end

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

      def accept
        shop = current_user.shop
        return render json: { error: "No shop found for this user" }, status: :unprocessable_content unless shop

        booking = find_shop_booking(shop)
        return render json: { error: "Booking not found" }, status: :not_found unless booking
        return render json: { error: "Booking is not pending" }, status: :unprocessable_content unless booking.pending?

        frontend_base_url = ENV.fetch("FRONTEND_BASE_URL", "http://localhost:5173")
        service = BookingPaymentService.new(booking)
        session = service.create_checkout_session(
          success_url: "#{frontend_base_url}/book?success=1&booking_id=#{booking.id}",
          cancel_url: "#{frontend_base_url}/book?canceled=1&booking_id=#{booking.id}"
        )

        booking.update!(stripe_payment_id: session.id, status: :accepted, accepted_at: Time.zone.now)

        email_sent = false
        begin
          BookingMailer.payment_link(booking: booking, checkout_url: session.url).deliver_now
          booking.update!(payment_status: :invoice_sent)
          email_sent = true
        rescue StandardError => e
          Rails.logger.warn("Failed to send booking payment email for booking=#{booking.id}: #{e.class} #{e.message}")
        end

        render json: { checkout_url: session.url, booking: booking, email_sent: email_sent }, status: :ok
      rescue Stripe::AuthenticationError
        render json: { error: "Stripe is not configured. Set STRIPE_SECRET_KEY (or credentials stripe.secret_key)." }, status: :internal_server_error
      rescue Stripe::InvalidRequestError => e
        render json: { error: e.message }, status: :unprocessable_content
      end

      def resend_invoice
        shop = current_user.shop
        return render json: { error: "No shop found for this user" }, status: :unprocessable_content unless shop

        booking = find_shop_booking(shop)
        return render json: { error: "Booking not found" }, status: :not_found unless booking
        return render json: { error: "Booking must be accepted and unpaid" }, status: :unprocessable_content unless booking.accepted? && !booking.payment_paid?

        checkout_url = BookingPaymentService.new(booking).checkout_url_from_session_id
        return render json: { error: "No invoice session found" }, status: :unprocessable_content if checkout_url.blank?

        BookingMailer.payment_link(booking: booking, checkout_url: checkout_url).deliver_now
        booking.update!(payment_status: :invoice_sent)

        render json: { email_sent: true }, status: :ok
      rescue Stripe::AuthenticationError
        render json: { error: "Stripe is not configured. Set STRIPE_SECRET_KEY (or credentials stripe.secret_key)." }, status: :internal_server_error
      end

      def cancel
        shop = current_user.shop
        return render json: { error: "No shop found for this user" }, status: :unprocessable_content unless shop

        booking = find_shop_booking(shop)
        return render json: { error: "Booking not found" }, status: :not_found unless booking

        if booking.canceled?
          return render json: booking, status: :ok
        end

        if booking.payment_paid?
          refund = BookingPaymentService.new(booking).refund_full!
          booking.update!(
            payment_status: :refunded,
            status: :canceled,
            canceled_at: Time.zone.now,
            refunded_at: Time.zone.now,
            stripe_refund_id: refund.id
          )
        else
          booking.update!(status: :canceled, canceled_at: Time.zone.now)
        end

        render json: booking, status: :ok
      rescue Stripe::AuthenticationError
        render json: { error: "Stripe is not configured. Set STRIPE_SECRET_KEY (or credentials stripe.secret_key)." }, status: :internal_server_error
      rescue Stripe::StripeError => e
        render json: { error: e.message }, status: :unprocessable_content
      end

      def decline
        shop = current_user.shop
        return render json: { error: "No shop found for this user" }, status: :unprocessable_content unless shop

        booking = find_shop_booking(shop)
        return render json: { error: "Booking not found" }, status: :not_found unless booking
        return render json: { error: "Booking is not pending" }, status: :unprocessable_content unless booking.pending?

        booking.update!(status: :declined, declined_at: Time.zone.now)
        render json: booking, status: :ok
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

      def find_shop_booking(shop)
        Booking.joins(:bay).where(bays: { shop_id: shop.id }).find_by(id: params[:id])
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
