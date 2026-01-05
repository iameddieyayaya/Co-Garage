class BookingMailer < ApplicationMailer
  def payment_link(booking:, checkout_url:)
    @booking = booking
    @checkout_url = checkout_url

    recipient = booking.user&.email || booking.guest_email
    return if recipient.blank?

    mail(
      to: recipient,
      subject: "Complete payment for your CoGarage booking (##{booking.id})"
    )
  end
end

