class Shop < ApplicationRecord
  belongs_to :owner, class_name: "User"
  has_many :bays, dependent: :destroy
  has_many :tools, dependent: :destroy
  has_many :bookings, through: :bays

  validates :name, presence: true
  validates :location, presence: true
end
