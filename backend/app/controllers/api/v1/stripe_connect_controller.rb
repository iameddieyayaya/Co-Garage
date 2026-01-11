module Api
  module V1
    class StripeConnectController < ApplicationController
      def status
        shop = current_user.shop
        return render json: { error: "No shop found for this user" }, status: :unprocessable_content unless shop

        render json: {
          stripe_account_id: shop.stripe_account_id,
          charges_enabled: shop.stripe_charges_enabled,
          payouts_enabled: shop.stripe_payouts_enabled,
          details_submitted: shop.stripe_details_submitted,
          ready_for_payouts: shop.stripe_ready_for_payouts?,
          platform_fee_percent: ENV.fetch("PLATFORM_FEE_PERCENT", "10")
        }, status: :ok
      end

      def create_account
        shop = current_user.shop
        return render json: { error: "No shop found for this user" }, status: :unprocessable_content unless shop
        return render json: { stripe_account_id: shop.stripe_account_id }, status: :ok if shop.stripe_account_id.present?

        account = StripeConnectService.create_express_account(shop: shop)
        shop.update!(stripe_account_id: account.id)

        render json: { stripe_account_id: account.id }, status: :created
      rescue Stripe::AuthenticationError
        render json: { error: "Stripe is not configured. Set STRIPE_SECRET_KEY (or credentials stripe.secret_key)." }, status: :internal_server_error
      end

      def onboarding_link
        shop = current_user.shop
        return render json: { error: "No shop found for this user" }, status: :unprocessable_content unless shop
        return render json: { error: "Stripe account not created" }, status: :unprocessable_content if shop.stripe_account_id.blank?

        frontend_base_url = ENV.fetch("FRONTEND_BASE_URL", "http://localhost:5173")
        link = StripeConnectService.account_onboarding_link(
          stripe_account_id: shop.stripe_account_id,
          refresh_url: "#{frontend_base_url}/dashboard?stripe=refresh",
          return_url: "#{frontend_base_url}/dashboard?stripe=return"
        )

        render json: { url: link.url }, status: :ok
      rescue Stripe::AuthenticationError
        render json: { error: "Stripe is not configured. Set STRIPE_SECRET_KEY (or credentials stripe.secret_key)." }, status: :internal_server_error
      end

      def login_link
        shop = current_user.shop
        return render json: { error: "No shop found for this user" }, status: :unprocessable_content unless shop
        return render json: { error: "Stripe account not created" }, status: :unprocessable_content if shop.stripe_account_id.blank?

        link = StripeConnectService.express_login_link(stripe_account_id: shop.stripe_account_id)
        render json: { url: link.url }, status: :ok
      rescue Stripe::AuthenticationError
        render json: { error: "Stripe is not configured. Set STRIPE_SECRET_KEY (or credentials stripe.secret_key)." }, status: :internal_server_error
      end
    end
  end
end
