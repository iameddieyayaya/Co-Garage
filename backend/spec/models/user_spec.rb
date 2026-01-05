require 'rails_helper'

RSpec.describe User, type: :model do
  describe "validations" do
    it "is valid with valid attributes" do
      user = User.new(
        name: "Alice Garage",
        email: "alice@example.com",
        password: "password123",
        password_confirmation: "password123",
        role: :shop_owner
      )
      expect(user).to be_valid
    end

    it "is valid without a name" do
      user = User.new(name: nil, email: "test@example.com", password: "password123", password_confirmation: "password123", role: :shop_owner)
      expect(user).to be_valid
    end

    it "is invalid without an email" do
      user = User.new(name: "Test", email: nil, password: "password123", password_confirmation: "password123", role: :shop_owner)
      expect(user).to_not be_valid
      expect(user.errors[:email]).to include("can't be blank")
    end

    it "is invalid with a duplicate email" do
      User.create!(name: "Existing", email: "duplicate@example.com", password: "password123", password_confirmation: "password123", role: :shop_owner)
      user = User.new(name: "Test", email: "duplicate@example.com", password: "password123", password_confirmation: "password123", role: :shop_owner)
      expect(user).to_not be_valid
      expect(user.errors[:email]).to include("has already been taken")
    end

    it "treats emails as case-insensitive for uniqueness" do
      User.create!(name: "Existing", email: "Duplicate@Example.com", password: "password123", password_confirmation: "password123", role: :shop_owner)
      user = User.new(name: "Test", email: "duplicate@example.com", password: "password123", password_confirmation: "password123", role: :shop_owner)
      expect(user).to_not be_valid
      expect(user.errors[:email]).to include("has already been taken")
    end

    it "normalizes email casing on save" do
      user = User.create!(name: "Existing", email: "Duplicate@Example.com", password: "password123", password_confirmation: "password123", role: :shop_owner)
      expect(user.email).to eq("duplicate@example.com")
    end

    it "is valid without a role" do
      user = User.new(name: "Test", email: "test@example.com", password: "password123", password_confirmation: "password123", role: nil)
      expect(user).to be_valid
    end
  end

  describe "authentication" do
    it "authenticates with correct password" do
      user = User.create!(name: "Alice Garage", email: "alice@example.com", password: "password123", password_confirmation: "password123", role: :shop_owner)
      expect(user.authenticate("password123")).to eq(user)
    end

    it "fails authentication with wrong password" do
      user = User.create!(name: "Alice Garage", email: "alice@example.com", password: "password123", password_confirmation: "password123", role: :shop_owner)
      expect(user.authenticate("wrongpassword")).to be_falsey
    end
  end
end
