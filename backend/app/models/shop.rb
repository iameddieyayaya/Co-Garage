class Shop < ApplicationRecord
  belongs_to :owner, class_name: "User"
  has_many :bays, dependent: :destroy
  has_many :tools, dependent: :destroy
  has_many :bookings, through: :bays

  validates :name, presence: true
  validates :location, presence: true

  def stripe_connected?
    stripe_account_id.present?
  end

  def stripe_ready_for_payouts?
    stripe_connected? && stripe_charges_enabled? && stripe_payouts_enabled?
  end
end
