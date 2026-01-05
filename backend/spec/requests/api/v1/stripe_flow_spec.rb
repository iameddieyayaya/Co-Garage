require 'rails_helper'

RSpec.describe "Api::V1::Stripe flow", type: :request do
  let(:owner) { User.create!(email: "owner@example.com", password: "password123", role: :shop_owner) }
  let(:token) { JwtService.encode({ user_id: owner.id }) }
  let(:headers) { { "Authorization" => "Bearer #{token}" } }

  it "allows shop owner to accept a pending booking and generate a Checkout link" do
    shop = Shop.create!(owner: owner, name: "Main Garage", location: "Austin, TX")
    bay = shop.bays.create!(description: "Lift bay", hourly_rate: 30, available: true)
    booking = Booking.create!(
      bay: bay,
      user: nil,
      guest_name: "Jane Doe",
      guest_email: "jane@example.com",
      start_time: Time.zone.local(2026, 1, 5, 9, 0, 0),
      end_time: Time.zone.local(2026, 1, 5, 13, 0, 0),
      total_price: 120,
      status: :pending
    )

    Stripe.api_key = "sk_test_123"
    ActionMailer::Base.deliveries.clear
    allow(Stripe::Checkout::Session).to receive(:create).and_return(OpenStruct.new(id: "cs_test_123", url: "https://checkout.test/session"))

    patch "/api/v1/bookings/#{booking.id}/accept", headers: headers

    expect(response).to have_http_status(:ok)
    expect(response.parsed_body["checkout_url"]).to eq("https://checkout.test/session")

    booking.reload
    expect(booking.status).to eq("accepted")
    expect(booking.stripe_payment_id).to eq("cs_test_123")
    expect(booking.paid).to eq(false)
    expect(booking.payment_status).to eq("invoice_sent")

    email = ActionMailer::Base.deliveries.last
    expect(email.to).to include("jane@example.com")
    expect(email.body.encoded).to include("https://checkout.test/session")
  end

  it "returns 500 with a helpful error when Stripe is not configured" do
    shop = Shop.create!(owner: owner, name: "Main Garage", location: "Austin, TX")
    bay = shop.bays.create!(description: "Lift bay", hourly_rate: 30, available: true)
    booking = Booking.create!(
      bay: bay,
      user: nil,
      guest_name: "Jane Doe",
      guest_email: "jane@example.com",
      start_time: Time.zone.local(2026, 1, 5, 9, 0, 0),
      end_time: Time.zone.local(2026, 1, 5, 13, 0, 0),
      total_price: 120,
      status: :pending
    )

    Stripe.api_key = nil

    patch "/api/v1/bookings/#{booking.id}/accept", headers: headers

    expect(response).to have_http_status(:internal_server_error)
    expect(response.parsed_body["error"]).to include("Stripe is not configured")
  end

  it "marks booking paid via webhook after Checkout completes" do
    shop = Shop.create!(owner: owner, name: "Main Garage", location: "Austin, TX")
    bay = shop.bays.create!(description: "Lift bay", hourly_rate: 30, available: true)
    booking = Booking.create!(
      bay: bay,
      user: nil,
      guest_name: "Jane Doe",
      guest_email: "jane@example.com",
      start_time: Time.zone.local(2026, 1, 5, 9, 0, 0),
      end_time: Time.zone.local(2026, 1, 5, 13, 0, 0),
      total_price: 120,
      status: :accepted,
      stripe_payment_id: "cs_test_123"
    )

    payload = {
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_123",
          metadata: { booking_id: booking.id }
        }
      }
    }.to_json

    post "/api/v1/stripe/webhook", params: payload, headers: { "CONTENT_TYPE" => "application/json" }

    expect(response).to have_http_status(:ok)
    booking.reload
    expect(booking.status).to eq("paid")
    expect(booking.paid).to eq(true)
    expect(booking.payment_status).to eq("paid")
  end
end
