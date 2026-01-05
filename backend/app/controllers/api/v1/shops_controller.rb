class Api::V1::ShopsController < ApplicationController
  before_action :authenticate_request

  def create
    if current_user.shop.present?
      render json: { error: "Shop already exists for current user" }, status: :unprocessable_entity
      return
    end

    shop = current_user.build_shop(shop_params.merge(active: true))
    if shop.save
      render json: shop, status: :created
    else
      render json: { errors: shop.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def current
    shop = current_user.shop
    if shop
      render json: shop, status: :ok
    else
      render json: { error: "No shop found for current user" }, status: :not_found
    end
  end

  private

  def shop_params
    params.require(:shop).permit(:name, :location, :description)
  end
end
