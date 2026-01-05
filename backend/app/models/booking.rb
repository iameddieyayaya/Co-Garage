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

  enum payment_status: {
    unpaid: 0,
    invoice_sent: 1,
    paid: 2
  }, _prefix: :payment

  before_validation :set_defaults, on: :create
  before_save :sync_paid_boolean

  validates :start_time, :end_time, :total_price, presence: true
  validates :guest_name, :guest_email, presence: true, unless: -> { user.present? }

  validate :end_after_start

  private

  def set_defaults
    self.status ||= :pending
    self.payment_status ||= :unpaid
    self.paid = false if paid.nil?
  end

  def sync_paid_boolean
    self.paid = payment_status == "paid"
  end

  def end_after_start
    return if end_time.blank? || start_time.blank?
    errors.add(:end_time, "must be after start time") if end_time <= start_time
  end
end
