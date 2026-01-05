class Booking < ApplicationRecord
  belongs_to :bay
  belongs_to :user, optional: true

  has_many :booking_tools, dependent: :destroy
  has_many :tools, through: :booking_tools

  enum status: {
    pending: 0,
    accepted: 1,
    paid: 2,
    declined: 3
  }

  before_validation :set_defaults, on: :create
  before_save :sync_paid_status

  validates :start_time, :end_time, :total_price, presence: true
  validates :guest_name, :guest_email, presence: true, unless: -> { user.present? }

  validate :end_after_start

  private

  def set_defaults
    self.status ||= :pending
    self.paid = false if paid.nil?
  end

  def sync_paid_status
    self.paid = true if status == "paid"
    self.status = "paid" if paid? && status != "paid"
  end

  def end_after_start
    return if end_time.blank? || start_time.blank?
    errors.add(:end_time, "must be after start time") if end_time <= start_time
  end
end
