require 'rails_helper'

RSpec.describe Booking, type: :model do
  let(:user) { User.create!(name: "Alice Garage", email: "alice@example.com", password: "password123", password_confirmation: "password123", role: :owner) }
  let(:shop) { Shop.create!(user: user, name: "Alice’s Garage", location: "San Diego, CA", description: "DIY auto garage with rentable bays and tools.", active: true) }
  let(:bay) { Bay.create!(shop: shop, description: "Lift bay", hourly_rate: 30, available: true) }

  subject do
    Booking.new(
      bay: bay,
      user: user,
      start_time: 1.day.from_now,
      end_time: 1.day.from_now + 2.hours,
      total_price: bay.hourly_rate * 2,
      guest_name: nil,
      guest_email: nil
    )
  end

  it "is valid with valid and paid attributes" do
    subject.paid = true
    expect(subject).to be_valid
  end

  it "is not valid if end_time is before start_time" do
    subject.end_time = subject.start_time - 1.hour
    expect(subject).not_to be_valid
  end

  describe "payments" do
    it "can have a stripe_payment_id and paid status" do
      subject.stripe_payment_id = "pi_1234567890"
      subject.paid = true
      expect(subject.stripe_payment_id).to eq("pi_1234567890")
      expect(subject.paid).to be_truthy
    end

    it "defaults to unpaid if not specified" do
      expect(subject.paid).to be_falsey
    end
  end

  it "is valid for a guest booking without a user" do
    subject.user = nil
    subject.guest_name = "John Doe"
    subject.guest_email = "john@example.com"
    subject.paid = true
    expect(subject).to be_valid
  end

  it "is valid if total_price is 0 (no payment needed)" do
    subject.total_price = 0
    subject.paid = false
    expect(subject).to be_valid
  end
end