class PaymentsController < ApplicationController
  def create
    booking = Booking.find(params[:booking_id])
    service = BookingPaymentService.new(booking)
    session = service.create_checkout_session(
      success_url: params[:success_url],
      cancel_url: params[:cancel_url]
    )
    render json: { id: session.id }
  end
end