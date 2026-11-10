require 'rails_helper'

RSpec.describe "Api::V1::Users", type: :request do
  describe "POST /api/v1/users" do
    it "creates an account without exposing the password digest" do
      post "/api/v1/users", params: {
        user: { name: "Demo Owner", email: "demo@example.com", password: "password123", role: "shop_owner" }
      }

      expect(response).to have_http_status(:created)
      expect(User.find_by!(email: "demo@example.com").authenticate("password123")).to be_truthy
      expect(JSON.parse(response.body)).to eq(
        "id" => User.find_by!(email: "demo@example.com").id,
        "name" => "Demo Owner",
        "email" => "demo@example.com",
        "role" => "shop_owner"
      )
    end
  end
end
