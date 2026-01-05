require 'rails_helper'

RSpec.describe "Api::V1::Bookings", type: :request do
  describe "POST /create" do
    it "creates a guest booking for a half day with tools" do
      owner = User.create!(email: "owner@example.com", password: "password123", role: :shop_owner)
      shop = Shop.create!(owner: owner, name: "Main Garage", location: "Austin, TX")
      bay = shop.bays.create!(description: "Lift bay", hourly_rate: 30, available: true)
      tool = shop.tools.create!(name: "Torque Wrench", description: "1/2in", day_rate: 10, available: true)

      post "/api/v1/bookings",
           params: {
             booking: {
               bay_id: bay.id,
               guest_name: "Jane Doe",
               guest_email: "jane@example.com",
               rental_date: "2026-01-05",
               duration: "half",
               slot: "morning",
               tools: [{ tool_id: tool.id, quantity: 2 }]
             }
           }

      expect(response).to have_http_status(:created)
      body = response.parsed_body
      expect(body["bay_id"]).to eq(bay.id)
      expect(body["guest_name"]).to eq("Jane Doe")
      expect(body["guest_email"]).to eq("jane@example.com")
      expect(body["booking_tools"].length).to eq(1)
      expect(body["booking_tools"][0]["quantity"]).to eq(2)
      expect(body["total_price"].to_s).to include("130")
    end

    it "rejects overlapping bookings" do
      owner = User.create!(email: "owner2@example.com", password: "password123", role: :shop_owner)
      shop = Shop.create!(owner: owner, name: "Main Garage", location: "Austin, TX")
      bay = shop.bays.create!(description: "Lift bay", hourly_rate: 30, available: true)

      Booking.create!(
        bay: bay,
        user: nil,
        guest_name: "Existing",
        guest_email: "existing@example.com",
        start_time: Time.zone.local(2026, 1, 5, 9, 0, 0),
        end_time: Time.zone.local(2026, 1, 5, 13, 0, 0),
        total_price: 120
      )

      post "/api/v1/bookings",
           params: {
             booking: {
               bay_id: bay.id,
               guest_name: "Jane Doe",
               guest_email: "jane@example.com",
               rental_date: "2026-01-05",
               duration: "half",
               slot: "morning"
             }
           }

      expect(response).to have_http_status(:unprocessable_content)
      expect(response.parsed_body["error"]).to eq("Bay is already booked for that time")
    end
  end
end
