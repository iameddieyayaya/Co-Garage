module Api
  module V1
    class ToolsController < ApplicationController
      def index
        shop = current_user.shop
        return render json: { error: "No shop found for this user" }, status: :unprocessable_content unless shop

        render json: shop.tools.order(created_at: :desc), status: :ok
      end

      def show
        shop = current_user.shop
        return render json: { error: "No shop found for this user" }, status: :unprocessable_content unless shop

        tool = shop.tools.find_by(id: params[:id])
        return render json: { error: "Tool not found" }, status: :not_found unless tool

        render json: tool, status: :ok
      end

      def create
        shop = current_user.shop
        return render json: { error: "No shop found for this user" }, status: :unprocessable_content unless shop

        tool = shop.tools.new(tool_params)
        if tool.save
          render json: tool, status: :created
        else
          Rails.logger.info "Tool validation errors: #{tool.errors.full_messages}"
          render json: { errors: tool.errors.full_messages }, status: :unprocessable_content
        end
      end

      private

      def tool_params
        params.require(:tool).permit(:name, :description, :day_rate, :available)
      end
    end
  end
end
