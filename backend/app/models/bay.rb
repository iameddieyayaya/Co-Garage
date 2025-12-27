class Bay < ApplicationRecord
  belongs_to :shop
  has_many :bookings, dependent: :destroy

  validates :hourly_rate, presence: true
  validates :description, presence: true
end