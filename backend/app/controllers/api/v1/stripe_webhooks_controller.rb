module Api
  module V1
    class StripeWebhooksController < ApplicationController
      skip_before_action :authenticate_request

      def create
        payload = request.raw_post
        sig_header = request.headers["Stripe-Signature"]
        webhook_secret = ENV["STRIPE_WEBHOOK_SECRET"]
        return head :bad_request if webhook_secret.blank?

        event = Stripe::Webhook.construct_event(payload, sig_header, webhook_secret)

        case event.type
        when "checkout.session.completed"
          handle_checkout_session_completed(event.data.object)
        when "account.updated"
          StripeConnectService.sync_account!(event.data.object)
        end

        head :ok
      rescue JSON::ParserError, Stripe::SignatureVerificationError
        head :bad_request
      end

      private

      def handle_checkout_session_completed(session)
        booking_id = session.metadata&.booking_id || session.metadata&.[]("booking_id")
        return if booking_id.blank?

        booking = Booking.find_by(id: booking_id)
        return unless booking&.accepted?
        return unless booking.stripe_payment_id == session.id
        return if session.payment_intent.blank?

        booking.update!(
          paid: true,
          status: :paid,
          payment_status: :paid,
          stripe_payment_intent_id: session.payment_intent
        )
      end
    end
  end
end
