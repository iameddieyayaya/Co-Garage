require 'rails_helper'

RSpec.describe "Api::V1::Stripe flow", type: :request do
  let(:owner) { User.create!(email: "owner@example.com", password: "password123", role: :shop_owner) }
  let(:token) { JwtService.encode({ user_id: owner.id }) }
  let(:headers) { { "Authorization" => "Bearer #{token}" } }

  def with_env(overrides)
    original = {}
    overrides.each do |key, value|
      original[key] = ENV.key?(key) ? ENV[key] : :__missing__
      if value.nil?
        ENV.delete(key)
      else
        ENV[key] = value
      end
    end

    yield
  ensure
    original.each do |key, value|
      if value == :__missing__
        ENV.delete(key)
      else
        ENV[key] = value
      end
    end
  end

  it "allows shop owner to accept a pending booking and generate a Checkout link" do
    shop = Shop.create!(owner: owner, name: "Main Garage", location: "Austin, TX")
    shop.update!(stripe_account_id: "acct_123", stripe_charges_enabled: true, stripe_payouts_enabled: true)
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
    allow(ENV).to receive(:fetch).and_call_original
    allow(ENV).to receive(:fetch).with("PLATFORM_FEE_PERCENT", "10").and_return("10")
    expect(Stripe::Checkout::Session).to receive(:create).with(
      hash_including(
        payment_intent_data: a_hash_including(
          transfer_data: a_hash_including(destination: "acct_123"),
          application_fee_amount: 1200
        ),
        metadata: a_hash_including(
          booking_id: booking.id,
          shop_id: shop.id
        )
      )
    ).and_return(OpenStruct.new(id: "cs_test_123", url: "https://checkout.test/session"))

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

  it "returns 422 when shop is not ready for payouts" do
    shop = Shop.create!(owner: owner, name: "Main Garage", location: "Austin, TX")
    shop.update!(stripe_account_id: "acct_123", stripe_charges_enabled: true, stripe_payouts_enabled: false)
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

    patch "/api/v1/bookings/#{booking.id}/accept", headers: headers

    expect(response).to have_http_status(:unprocessable_content)
    expect(response.parsed_body["error"]).to include("Shop is not ready for payouts")
    booking.reload
    expect(booking.status).to eq("pending")
  end

  it "prevents a shop owner from accepting another shop's booking" do
    Shop.create!(owner: owner, name: "Owner Garage", location: "Austin, TX")
    other_owner = User.create!(email: "other-owner@example.com", password: "password123", role: :shop_owner)
    shop = Shop.create!(owner: other_owner, name: "Other Garage", location: "Austin, TX")
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

    patch "/api/v1/bookings/#{booking.id}/accept", headers: headers

    expect(response).to have_http_status(:not_found)
    expect(booking.reload).to have_attributes(status: "pending", stripe_payment_id: nil)
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

  it "resends an invoice email for an accepted unpaid booking" do
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
      payment_status: :invoice_sent,
      stripe_payment_id: "cs_test_123"
    )

    Stripe.api_key = "sk_test_123"
    ActionMailer::Base.deliveries.clear
    allow(Stripe::Checkout::Session).to receive(:retrieve).and_return(OpenStruct.new(url: "https://checkout.test/session"))

    patch "/api/v1/bookings/#{booking.id}/resend_invoice", headers: headers

    expect(response).to have_http_status(:ok)
    expect(response.parsed_body["email_sent"]).to eq(true)
    expect(ActionMailer::Base.deliveries.last.to).to include("jane@example.com")
  end

  it "cancels and refunds a paid booking" do
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
      status: :paid,
      payment_status: :paid,
      stripe_payment_intent_id: "pi_test_123"
    )

    Stripe.api_key = "sk_test_123"
    allow(Stripe::Refund).to receive(:create).and_return(OpenStruct.new(id: "re_test_123"))

    patch "/api/v1/bookings/#{booking.id}/cancel", headers: headers

    expect(response).to have_http_status(:ok)
    booking.reload
    expect(booking.status).to eq("canceled")
    expect(booking.payment_status).to eq("refunded")
    expect(booking.stripe_refund_id).to eq("re_test_123")
  end

  it "marks booking paid via a valid signed webhook after Checkout completes" do
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
          payment_intent: "pi_test_123",
          metadata: { booking_id: booking.id }
        }
      }
    }.to_json

    with_env("STRIPE_WEBHOOK_SECRET" => "whsec_test") do
      event = Stripe::Event.construct_from(JSON.parse(payload, symbolize_names: true))
      expect(Stripe::Webhook).to receive(:construct_event)
        .with(payload, "valid-signature", "whsec_test")
        .and_return(event)

      post "/api/v1/stripe/webhook",
           params: payload,
           headers: { "CONTENT_TYPE" => "application/json", "Stripe-Signature" => "valid-signature" }
    end

    expect(response).to have_http_status(:ok)
    booking.reload
    expect(booking.status).to eq("paid")
    expect(booking.paid).to eq(true)
    expect(booking.payment_status).to eq("paid")
    expect(booking.stripe_payment_intent_id).to eq("pi_test_123")
  end

  it "rejects unsigned payment events when no webhook secret is configured" do
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
      status: :accepted
    )
    payload = {
      type: "checkout.session.completed",
      data: { object: { id: "cs_test_123", payment_intent: "pi_test_123", metadata: { booking_id: booking.id } } }
    }.to_json

    with_env("STRIPE_WEBHOOK_SECRET" => nil) do
      post "/api/v1/stripe/webhook",
           params: payload,
           headers: { "CONTENT_TYPE" => "application/json" }
    end

    expect(response).to have_http_status(:bad_request)
    expect(booking.reload).to have_attributes(status: "accepted", payment_status: "unpaid", paid: false)
  end


  it "returns 400 for invalid webhook signatures when STRIPE_WEBHOOK_SECRET is set" do
    with_env("STRIPE_WEBHOOK_SECRET" => "whsec_test") do
      allow(Stripe::Webhook).to receive(:construct_event).and_raise(
        Stripe::SignatureVerificationError.new("invalid", "sig")
      )

      post "/api/v1/stripe/webhook",
        params: { type: "checkout.session.completed" }.to_json,
        headers: { "CONTENT_TYPE" => "application/json", "Stripe-Signature" => "bad" }

      expect(response).to have_http_status(:bad_request)
    end
  end

  it "updates shop Stripe fields via a valid signed account.updated webhook" do
    shop = Shop.create!(owner: owner, name: "Main Garage", location: "Austin, TX")
    event = OpenStruct.new(
      type: "account.updated",
      data: OpenStruct.new(
        object: OpenStruct.new(
          id: "acct_123",
          charges_enabled: true,
          payouts_enabled: true,
          details_submitted: true,
          metadata: OpenStruct.new(shop_id: shop.id)
        )
      )
    )
    payload = { type: "account.updated" }.to_json

    with_env("STRIPE_WEBHOOK_SECRET" => "whsec_test") do
      allow(Stripe::Webhook).to receive(:construct_event).and_return(event)
      post "/api/v1/stripe/webhook",
           params: payload,
           headers: { "CONTENT_TYPE" => "application/json", "Stripe-Signature" => "valid-signature" }
    end

    expect(response).to have_http_status(:ok)
    shop.reload
    expect(shop.stripe_account_id).to eq("acct_123")
    expect(shop.stripe_charges_enabled).to eq(true)
    expect(shop.stripe_payouts_enabled).to eq(true)
    expect(shop.stripe_details_submitted).to eq(true)
  end

  it "completes discovery, booking, payment, webhook, and refund lifecycle" do
    shop = Shop.create!(owner: owner, name: "Lifecycle Garage", location: "Austin, TX", active: true)
    shop.update!(stripe_account_id: "acct_lifecycle", stripe_charges_enabled: true, stripe_payouts_enabled: true)
    bay = shop.bays.create!(description: "Lift bay", hourly_rate: 30, available: true)

    get "/api/v1/public/shops"
    expect(response).to have_http_status(:ok)
    expect(response.parsed_body.map { |entry| entry["id"] }).to include(shop.id)

    get "/api/v1/public/bays", params: { shop_id: shop.id }
    expect(response).to have_http_status(:ok)
    expect(response.parsed_body.map { |entry| entry["id"] }).to include(bay.id)

    post "/api/v1/bookings",
         params: {
           booking: {
             bay_id: bay.id,
             guest_name: "Lifecycle Guest",
             guest_email: "guest@example.com",
             rental_date: "2026-01-05",
             duration: "half",
             slot: "morning"
           }
         }
    expect(response).to have_http_status(:created)
    booking = Booking.find(response.parsed_body["id"])
    expect(booking).to have_attributes(status: "pending", payment_status: "unpaid", total_price: BigDecimal("120"))

    Stripe.api_key = "sk_test_123"
    ActionMailer::Base.deliveries.clear
    allow(Stripe::Checkout::Session).to receive(:create)
      .and_return(OpenStruct.new(id: "cs_lifecycle", url: "https://checkout.test/lifecycle"))
    patch "/api/v1/bookings/#{booking.id}/accept", headers: headers
    expect(response).to have_http_status(:ok)
    expect(response.parsed_body["checkout_url"]).to eq("https://checkout.test/lifecycle")
    expect(response.parsed_body["email_sent"]).to eq(true)
    expect(booking.reload).to have_attributes(status: "accepted", payment_status: "invoice_sent")

    payload = { type: "checkout.session.completed" }.to_json
    event = OpenStruct.new(
      type: "checkout.session.completed",
      data: OpenStruct.new(
        object: OpenStruct.new(
          id: "cs_lifecycle",
          payment_intent: "pi_lifecycle",
          metadata: OpenStruct.new(booking_id: booking.id)
        )
      )
    )
    with_env("STRIPE_WEBHOOK_SECRET" => "whsec_lifecycle") do
      allow(Stripe::Webhook).to receive(:construct_event).and_return(event)
      post "/api/v1/stripe/webhook",
           params: payload,
           headers: { "CONTENT_TYPE" => "application/json", "Stripe-Signature" => "valid-signature" }
    end
    expect(response).to have_http_status(:ok)
    expect(booking.reload).to have_attributes(status: "paid", payment_status: "paid", paid: true)

    allow(Stripe::Refund).to receive(:create).and_return(OpenStruct.new(id: "re_lifecycle"))
    patch "/api/v1/bookings/#{booking.id}/cancel", headers: headers
    expect(response).to have_http_status(:ok)
    expect(booking.reload).to have_attributes(
      status: "canceled",
      payment_status: "refunded",
      stripe_refund_id: "re_lifecycle"
    )
  end
end
