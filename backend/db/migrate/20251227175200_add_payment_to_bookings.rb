class AddPaymentToBookings < ActiveRecord::Migration[7.1]
  def change
    add_column :bookings, :stripe_payment_id, :string
    add_column :bookings, :paid, :boolean
  end
end
