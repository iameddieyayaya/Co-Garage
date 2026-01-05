module Api
  module V1
    module Public
      class ToolsController < ApplicationController
        skip_before_action :authenticate_request

        def index
          tools = Tool.includes(:shop).where(available: true)
          tools = tools.where(shop_id: params[:shop_id]) if params[:shop_id].present?
          tools = tools.order(created_at: :desc)

          render json: tools.map { |tool|
            tool.as_json(only: [:id, :shop_id, :name, :description, :day_rate, :available]).merge(
              shop: tool.shop.as_json(only: [:id, :name, :location])
            )
          }, status: :ok
        end
      end
    end
  end
end

