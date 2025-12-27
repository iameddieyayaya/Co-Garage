class BookingPaymentService
  def initialize(booking)
    @booking = booking
  end

  def create_checkout_session(success_url:, cancel_url:)
    Stripe::Checkout::Session.create(
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: "Booking: #{@booking.bay.description}"
          },
          unit_amount: (@booking.total_price * 100).to_i
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: success_url,
      cancel_url: cancel_url,
      metadata: {
        booking_id: @booking.id
      }
    )
  end
end