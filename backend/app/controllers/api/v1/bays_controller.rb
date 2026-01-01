module Api
  module V1
    class BaysController < ApplicationController
      def create
        shop = current_user.shop
        return render json: { error: "No shop found for this user" }, status: :unprocessable_content unless shop
      
        bay = shop.bays.new(bay_params)
        if bay.save
          render json: bay, status: :created
        else
          Rails.logger.info "Bay validation errors: #{bay.errors.full_messages}"
          render json: { errors: bay.errors.full_messages }, status: :unprocessable_content
        end
      end

      private

      def bay_params
        params.require(:bay).permit(:description, :hourly_rate, :available)
      end
    end
  end
end