require 'rails_helper'

RSpec.describe "Api::V1::Tools", type: :request do
  let(:user) { User.create!(email: "owner@example.com", password: "password123", role: :shop_owner) }
  let(:token) { JwtService.encode({ user_id: user.id }) }
  let(:headers) { { "Authorization" => "Bearer #{token}" } }

  describe "GET /index" do
    it "returns 401 when unauthenticated" do
      get "/api/v1/tools"

      expect(response).to have_http_status(:unauthorized)
    end

    it "returns 422 when the user has no shop" do
      get "/api/v1/tools", headers: headers

      expect(response).to have_http_status(:unprocessable_content)
      expect(response.parsed_body["error"]).to eq("No shop found for this user")
    end

    it "returns the current user's shop tools" do
      shop = Shop.create!(owner: user, name: "Main Garage", location: "Austin, TX")
      shop.tools.create!(name: "Torque Wrench", description: "1/2in", day_rate: 8, available: true)
      shop.tools.create!(name: "Engine Hoist", description: "2 ton", day_rate: 20, available: false)

      get "/api/v1/tools", headers: headers

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body.length).to eq(2)
      expect(response.parsed_body.map { |t| t["name"] }).to contain_exactly("Torque Wrench", "Engine Hoist")
    end
  end

  describe "POST /create" do
    it "returns 401 when unauthenticated" do
      post "/api/v1/tools", params: { tool: { name: "Torque Wrench", day_rate: 8, available: true } }

      expect(response).to have_http_status(:unauthorized)
    end

    it "returns 422 when the user has no shop" do
      post "/api/v1/tools",
           params: { tool: { name: "Torque Wrench", day_rate: 8, available: true } },
           headers: headers

      expect(response).to have_http_status(:unprocessable_content)
      expect(response.parsed_body["error"]).to eq("No shop found for this user")
    end

    it "creates a tool for the current user's shop" do
      Shop.create!(owner: user, name: "Main Garage", location: "Austin, TX")

      post "/api/v1/tools",
           params: { tool: { name: "Torque Wrench", description: "1/2in", day_rate: 8, available: true } },
           headers: headers

      expect(response).to have_http_status(:created)
      expect(response.parsed_body["name"]).to eq("Torque Wrench")
      expect(response.parsed_body["description"]).to eq("1/2in")
      expect(response.parsed_body["available"]).to eq(true)
      expect(response.parsed_body["day_rate"].to_s).to include("8")
    end
  end
end
