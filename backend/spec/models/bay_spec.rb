require 'rails_helper'

RSpec.describe Bay, type: :model do
  subject { described_class.new(description: "Lift bay", hourly_rate: 30, available: true, shop: shop) }
  let(:shop) { Shop.create!(name: "Alice’s Garage", location: "San Diego", description: "DIY Garage", user: User.create!(name: "Alice", email: "alice@example.com", password: "password", role: :owner)) }

  it "is valid with valid attributes" do
    expect(subject).to be_valid
  end

  it "is not valid without a description" do
    subject.description = nil
    expect(subject).not_to be_valid
  end

  it "is not valid without an hourly_rate" do
    subject.hourly_rate = nil
    expect(subject).not_to be_valid
  end

  it "belongs to a shop" do
    expect(subject.shop).to eq(shop)
  end

  it "can have many bookings" do
    subject.save!
    booking = Booking.create!(bay: subject, start_time: 1.day.from_now, end_time: 2.days.from_now, guest_name: "John Doe", guest_email: "john@example.com", total_price: 100)
    expect(subject.bookings.first).to eq(booking)
  end
end
