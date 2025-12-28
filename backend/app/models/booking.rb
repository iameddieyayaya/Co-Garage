class Booking < ApplicationRecord
  belongs_to :bay
  belongs_to :user, optional: true

  has_many :booking_tools, dependent: :destroy
  has_many :tools, through: :booking_tools

  validates :start_time, :end_time, :total_price, presence: true
  validates :guest_name, :guest_email, presence: true, unless: -> { user.present? }

  validate :end_after_start
  validate :must_be_paid, on: :update

  private

  def end_after_start
    return if end_time.blank? || start_time.blank?
    errors.add(:end_time, "must be after start time") if end_time <= start_time
  end

  def must_be_paid
    errors.add(:paid, "must be paid before booking is confirmed") unless paid?
  end
end