module Api
  module V1
    module Public
      class ShopsController < ApplicationController
        skip_before_action :authenticate_request

        def index
          shops = Shop.where(active: true).order(created_at: :desc)

          bay_stats = Bay.where(available: true).group(:shop_id).pluck(:shop_id, Arel.sql("COUNT(*)"), Arel.sql("MIN(hourly_rate)"))
          tool_stats = Tool.where(available: true).group(:shop_id).pluck(:shop_id, Arel.sql("COUNT(*)"))

          bays_by_shop = bay_stats.to_h { |shop_id, count, min_rate| [shop_id, { count: count.to_i, min_rate: min_rate }] }
          tools_by_shop = tool_stats.to_h { |shop_id, count| [shop_id, count.to_i] }

          render json: shops.map { |shop|
            bay_info = bays_by_shop[shop.id] || { count: 0, min_rate: nil }
            {
              id: shop.id,
              name: shop.name,
              location: shop.location,
              description: shop.description,
              available_bays_count: bay_info[:count],
              starting_hourly_rate: bay_info[:min_rate],
              available_tools_count: tools_by_shop[shop.id] || 0
            }
          }, status: :ok
        end
      end
    end
  end
end

