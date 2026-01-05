module Api
  module V1
    module Public
      class BaysController < ApplicationController
        skip_before_action :authenticate_request

        def index
          bays = Bay.includes(:shop).where(available: true)
          bays = bays.where(shop_id: params[:shop_id]) if params[:shop_id].present?
          bays = bays.order(created_at: :desc)

          render json: bays.map { |bay|
            bay.as_json(only: [:id, :shop_id, :description, :hourly_rate, :available]).merge(
              shop: bay.shop.as_json(only: [:id, :name, :location])
            )
          }, status: :ok
        end
      end
    end
  end
end
