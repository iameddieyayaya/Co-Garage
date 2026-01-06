class BookingPaymentService
  def initialize(booking)
    @booking = booking
  end

  def create_checkout_session(success_url:, cancel_url:)
    raise Stripe::AuthenticationError.new("Stripe is not configured") if Stripe.api_key.blank?

    shop = @booking.bay.shop
    raise Stripe::InvalidRequestError.new("Shop is not connected to Stripe", nil) if shop.stripe_account_id.blank?
    raise Stripe::InvalidRequestError.new("Shop is not ready for payouts", nil) unless shop.stripe_charges_enabled? && shop.stripe_payouts_enabled?

    platform_fee_percent = ENV.fetch("PLATFORM_FEE_PERCENT", "10").to_f
    total_cents = (@booking.total_price.to_d * 100).to_i
    application_fee_amount = (total_cents * platform_fee_percent / 100.0).round

    Stripe::Checkout::Session.create(
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: "Booking: #{@booking.bay.description}"
          },
          unit_amount: total_cents
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: success_url,
      cancel_url: cancel_url,
      payment_intent_data: {
        application_fee_amount: application_fee_amount,
        transfer_data: {
          destination: shop.stripe_account_id
        }
      },
      metadata: {
        booking_id: @booking.id,
        shop_id: @booking.bay.shop_id,
        platform_fee_percent: platform_fee_percent.to_s
      }
    )
  end

  def checkout_url_from_session_id
    raise Stripe::AuthenticationError.new("Stripe is not configured") if Stripe.api_key.blank?
    return nil if @booking.stripe_payment_id.blank?

    session = Stripe::Checkout::Session.retrieve(@booking.stripe_payment_id)
    session.url
  end

  def refund_full!
    raise Stripe::AuthenticationError.new("Stripe is not configured") if Stripe.api_key.blank?
    raise Stripe::InvalidRequestError.new("Missing payment intent", nil) if @booking.stripe_payment_intent_id.blank?

    Stripe::Refund.create(payment_intent: @booking.stripe_payment_intent_id)
  end
end
