class StripeConnectService
  def self.create_express_account(shop:)
    raise Stripe::AuthenticationError.new("Stripe is not configured") if Stripe.api_key.blank?

    Stripe::Account.create(
      type: "express",
      country: ENV.fetch("STRIPE_ACCOUNT_COUNTRY", "US"),
      email: shop.owner.email,
      business_profile: {
        name: shop.name,
        product_description: "Garage bay and tool rentals"
      },
      metadata: {
        shop_id: shop.id
      }
    )
  end

  def self.account_onboarding_link(stripe_account_id:, refresh_url:, return_url:)
    raise Stripe::AuthenticationError.new("Stripe is not configured") if Stripe.api_key.blank?

    Stripe::AccountLink.create(
      account: stripe_account_id,
      refresh_url: refresh_url,
      return_url: return_url,
      type: "account_onboarding"
    )
  end

  def self.sync_account!(stripe_account)
    shop_id = stripe_account.metadata&.shop_id || stripe_account.metadata&.[]("shop_id")
    return if shop_id.blank?

    shop = Shop.find_by(id: shop_id)
    return unless shop

    shop.update!(
      stripe_account_id: stripe_account.id,
      stripe_charges_enabled: !!stripe_account.charges_enabled,
      stripe_payouts_enabled: !!stripe_account.payouts_enabled,
      stripe_details_submitted: !!stripe_account.details_submitted
    )
  end
end

