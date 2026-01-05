require 'rails_helper'

RSpec.describe "Api::V1::Shops", type: :request do
  let(:user) { User.create!(email: "owner@example.com", password: "password123", role: :shop_owner) }
  let(:token) { JwtService.encode({ user_id: user.id }) }
  let(:headers) { { "Authorization" => "Bearer #{token}" } }

  describe "GET /current" do
    it "returns current shop when it exists" do
      shop = Shop.create!(owner: user, name: "Main Garage", location: "Austin, TX")

      get "/api/v1/shops/current", headers: headers

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["id"]).to eq(shop.id)
      expect(response.parsed_body["name"]).to eq("Main Garage")
    end

    it "returns 404 when no shop exists" do
      get "/api/v1/shops/current", headers: headers

      expect(response).to have_http_status(:not_found)
      expect(response.parsed_body["error"]).to eq("No shop found for current user")
    end
  end

  describe "POST /create" do
    it "creates a shop for the current user" do
      post "/api/v1/shops",
           params: { shop: { name: "Main Garage", location: "Austin, TX", description: "Downtown spot" } },
           headers: headers

      expect(response).to have_http_status(:created)
      expect(response.parsed_body["name"]).to eq("Main Garage")
      expect(response.parsed_body["location"]).to eq("Austin, TX")
      expect(response.parsed_body["active"]).to eq(true)
    end

    it "rejects a second shop for the same user" do
      Shop.create!(owner: user, name: "Main Garage", location: "Austin, TX")

      post "/api/v1/shops",
           params: { shop: { name: "Other Garage", location: "Dallas, TX" } },
           headers: headers

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body["error"]).to eq("Shop already exists for current user")
    end
  end
end
