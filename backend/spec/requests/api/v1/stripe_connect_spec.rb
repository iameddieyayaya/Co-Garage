require "rails_helper"

RSpec.describe "Api::V1::StripeConnect", type: :request do
  let(:owner) { User.create!(email: "owner@example.com", password: "password123", role: :shop_owner) }
  let(:token) { JwtService.encode({ user_id: owner.id }) }
  let(:headers) { { "Authorization" => "Bearer #{token}" } }

  it "creates an express account and returns an onboarding link" do
    Shop.create!(owner: owner, name: "Main Garage", location: "Austin, TX", active: true)

    Stripe.api_key = "sk_test_123"
    allow(Stripe::Account).to receive(:create).and_return(OpenStruct.new(id: "acct_123"))
    allow(Stripe::AccountLink).to receive(:create).and_return(OpenStruct.new(url: "https://connect.test/onboarding"))

    post "/api/v1/stripe_connect/create_account", headers: headers
    expect(response).to have_http_status(:created)
    expect(response.parsed_body["stripe_account_id"]).to eq("acct_123")

    post "/api/v1/stripe_connect/onboarding_link", headers: headers
    expect(response).to have_http_status(:ok)
    expect(response.parsed_body["url"]).to eq("https://connect.test/onboarding")
  end

  it "returns a Stripe dashboard login link for a connected account" do
    shop = Shop.create!(owner: owner, name: "Main Garage", location: "Austin, TX", active: true)
    shop.update!(stripe_account_id: "acct_123")

    Stripe.api_key = "sk_test_123"
    allow(Stripe::Account).to receive(:create_login_link).and_return(OpenStruct.new(url: "https://connect.test/login"))

    post "/api/v1/stripe_connect/login_link", headers: headers

    expect(response).to have_http_status(:ok)
    expect(response.parsed_body["url"]).to eq("https://connect.test/login")
  end
end
