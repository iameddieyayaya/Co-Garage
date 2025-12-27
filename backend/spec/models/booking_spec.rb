require "rails_helper"

RSpec.describe Booking, type: :model do
  let(:user) { User.create!(name: "Alice", email: "alice@example.com", password: "password", role: :owner) }
  let(:shop) { Shop.create!(name: "Alice’s Garage", location: "San Diego", description: "DIY Garage", user: user) }
  let(:bay) { Bay.create!(description: "Lift bay", hourly_rate: 30, available: true, shop: shop) }
  let(:tool) { Tool.create!(name: "Jack Stand", description: "Heavy-duty", hourly_rate: 5, available: true, shop: shop) }

  subject { described_class.new(bay: bay, start_time: 1.day.from_now, end_time: 1.day.from_now + 2.hours, guest_name: "John Doe", guest_email: "john@example.com", total_price: 60) }

  it "is valid with valid attributes" do
    expect(subject).to be_valid
  end

  it "is not valid without a bay" do
    subject.bay = nil
    expect(subject).not_to be_valid
  end

  it "is not valid without a start_time or end_time" do
    subject.start_time = nil
    expect(subject).not_to be_valid
    subject.start_time = 1.day.from_now
    subject.end_time = nil
    expect(subject).not_to be_valid
  end

  it "ensures end_time is after start_time" do
    subject.end_time = subject.start_time - 1.hour
    expect(subject).not_to be_valid
  end

  it "can have many tools through booking_tools" do
    subject.save!
    BookingTool.create!(booking: subject, tool: tool, quantity: 1)
    expect(subject.tools.first).to eq(tool)
  end
end