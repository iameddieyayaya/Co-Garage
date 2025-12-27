class BookingTool < ApplicationRecord
  belongs_to :booking
  belongs_to :tool

  validates :quantity, numericality: { greater_than: 0 }
end
