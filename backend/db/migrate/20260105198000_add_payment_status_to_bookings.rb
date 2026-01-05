class AddPaymentStatusToBookings < ActiveRecord::Migration[7.1]
  def change
    add_column :bookings, :payment_status, :integer, null: false, default: 0
  end
end

