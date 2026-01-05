require 'rails_helper'

RSpec.describe "Api::V1::Bays", type: :request do
  let(:user) { User.create!(email: "owner@example.com", password: "password123", role: :shop_owner) }
  let(:token) { JwtService.encode({ user_id: user.id }) }
  let(:headers) { { "Authorization" => "Bearer #{token}" } }

  describe "GET /index" do
    it "returns 401 when unauthenticated" do
      get "/api/v1/bays"

      expect(response).to have_http_status(:unauthorized)
    end

    it "returns 422 when the user has no shop" do
      get "/api/v1/bays", headers: headers

      expect(response).to have_http_status(:unprocessable_content)
      expect(response.parsed_body["error"]).to eq("No shop found for this user")
    end

    it "returns the current user's shop bays" do
      shop = Shop.create!(owner: user, name: "Main Garage", location: "Austin, TX")
      shop.bays.create!(description: "Big bay", hourly_rate: 20, available: true)
      shop.bays.create!(description: "Small bay", hourly_rate: 10, available: false)

      get "/api/v1/bays", headers: headers

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body.length).to eq(2)
      expect(response.parsed_body.map { |b| b["description"] }).to contain_exactly("Big bay", "Small bay")
    end
  end

  describe "POST /create" do
    it "returns 401 when unauthenticated" do
      post "/api/v1/bays", params: { bay: { description: "Big bay", hourly_rate: 20, available: true } }

      expect(response).to have_http_status(:unauthorized)
    end

    it "returns 422 when the user has no shop" do
      post "/api/v1/bays",
           params: { bay: { description: "Big bay", hourly_rate: 20, available: true } },
           headers: headers

      expect(response).to have_http_status(:unprocessable_content)
      expect(response.parsed_body["error"]).to eq("No shop found for this user")
    end

    it "creates a bay for the current user's shop" do
      Shop.create!(owner: user, name: "Main Garage", location: "Austin, TX")

      post "/api/v1/bays",
           params: { bay: { description: "Big bay with lift", hourly_rate: 20, available: true } },
           headers: headers

      expect(response).to have_http_status(:created)
      expect(response.parsed_body["description"]).to eq("Big bay with lift")
      expect(response.parsed_body["available"]).to eq(true)
      expect(response.parsed_body["hourly_rate"].to_s).to include("20")
    end
  end
end
