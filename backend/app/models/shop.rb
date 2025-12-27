class Shop < ApplicationRecord
  belongs_to :user
  has_many :bays, dependent: :destroy
  has_many :tools, dependent: :destroy
  has_many :bookings, through: :bays

  validates :name, presence: true
  validates :location, presence: true
end
