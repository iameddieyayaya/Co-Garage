require 'rails_helper'

RSpec.describe "Api::V1::Public::Shops", type: :request do
  describe "GET /index" do
    it "lists active shops with availability stats" do
      owner = User.create!(email: "owner@example.com", password: "password123", role: :shop_owner)
      active_shop = Shop.create!(owner: owner, name: "Main Garage", location: "Austin, TX", description: "Downtown", active: true)
      inactive_shop = Shop.create!(owner: owner, name: "Closed Garage", location: "Austin, TX", description: "Closed", active: false)

      active_shop.bays.create!(description: "Bay 1", hourly_rate: 20, available: true)
      active_shop.bays.create!(description: "Bay 2", hourly_rate: 50, available: true)
      active_shop.bays.create!(description: "Bay 3", hourly_rate: 10, available: false)
      active_shop.tools.create!(name: "Torque Wrench", description: "1/2in", day_rate: 10, available: true)

      get "/api/v1/public/shops"

      expect(response).to have_http_status(:ok)
      body = response.parsed_body
      expect(body.length).to eq(1)
      expect(body[0]["id"]).to eq(active_shop.id)
      expect(body[0]["available_bays_count"]).to eq(2)
      expect(body[0]["starting_hourly_rate"].to_s).to include("20")
      expect(body[0]["available_tools_count"]).to eq(1)
      expect(body.map { |s| s["id"] }).not_to include(inactive_shop.id)
    end
  end
end

