class Bay < ApplicationRecord
  belongs_to :shop
  has_many :bookings, dependent: :destroy

  validates :description, presence: true
  validates :hourly_rate, numericality: { greater_than_or_equal_to: 0 }
end