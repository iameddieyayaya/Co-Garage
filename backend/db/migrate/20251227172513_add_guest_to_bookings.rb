class AddGuestToBookings < ActiveRecord::Migration[7.1]
  def change
    add_column :bookings, :guest_name, :string
    add_column :bookings, :guest_email, :string
  end
end
