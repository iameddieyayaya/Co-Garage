class AddStripeAndCancellationFieldsToBookings < ActiveRecord::Migration[7.1]
  def change
    add_column :bookings, :stripe_payment_intent_id, :string
    add_column :bookings, :stripe_refund_id, :string
    add_column :bookings, :refunded_at, :datetime
    add_column :bookings, :canceled_at, :datetime
  end
end

