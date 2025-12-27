require "rails_helper"

RSpec.describe Shop, type: :model do
  let(:owner) { User.create!(name: "Alice Garage", email: "alice@example.com", password: "password123", password_confirmation: "password123", role: :owner) }

  subject do
    described_class.new(
      user: owner,
      name: "Alice’s Garage",
      location: "San Diego, CA",
      description: "DIY auto garage with rentable bays and tools."
    )
  end

  # Validations
  it "is valid with valid attributes" do
    expect(subject).to be_valid
  end

  it "is not valid without a name" do
    subject.name = nil
    expect(subject).not_to be_valid
  end

  it "is not valid without a location" do
    subject.location = nil
    expect(subject).not_to be_valid
  end

  it "is not valid without a user" do
    subject.user = nil
    expect(subject).not_to be_valid
  end

  # Associations
  it "belongs to a user" do
    expect(subject.user).to eq(owner)
  end

  it "can have many bays" do
    bay1 = subject.bays.build(hourly_rate: 20, description: "Lift bay")
    bay2 = subject.bays.build(hourly_rate: 15, description: "Open bay")
    expect(subject.bays).to include(bay1, bay2)
  end
end