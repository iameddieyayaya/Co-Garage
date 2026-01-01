class Api::V1::ShopsController < ApplicationController
  before_action :authenticate_request!
  def current
    shop = current_user.shop
    if shop
      render json: shop, status: :ok
    else
      render json: { error: "No shop found for current user" }, status: :not_found
    end
  end
end
