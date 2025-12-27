require "rails_helper"

RSpec.describe Tool, type: :model do
  subject { described_class.new(name: "Jack Stand", description: "Heavy-duty", hourly_rate: 5, available: true, shop: shop) }
  let(:shop) { Shop.create!(name: "Alice’s Garage", location: "San Diego", description: "DIY Garage", user: User.create!(name: "Alice", email: "alice@example.com", password: "password", role: :owner)) }

  it "is valid with valid attributes" do
    expect(subject).to be_valid
  end

  it "is not valid without a name" do
    subject.name = nil
    expect(subject).not_to be_valid
  end

  it "belongs to a shop" do
    expect(subject.shop).to eq(shop)
  end

  it "can have many bookings through booking_tools" do
    subject.save!
    booking = Booking.create!(bay: Bay.create!(description: "Lift bay", hourly_rate: 30, available: true, shop: shop), start_time: 1.day.from_now, end_time: 1.day.from_now + 2.hours, guest_name: "John Doe", guest_email: "john@example.com", total_price: 60)
    BookingTool.create!(booking: booking, tool: subject, quantity: 1)
    expect(subject.bookings.first).to eq(booking)
  end
end