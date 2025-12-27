class Tool < ApplicationRecord
  belongs_to :shop
  has_many :booking_tools, dependent: :destroy
  has_many :bookings, through: :booking_tools


  validates :name, presence: true
  validates :hourly_rate, presence: true
end
