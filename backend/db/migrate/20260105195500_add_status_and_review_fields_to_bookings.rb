class AddStatusAndReviewFieldsToBookings < ActiveRecord::Migration[7.1]
  def change
    add_column :bookings, :status, :integer, null: false, default: 0
    add_column :bookings, :accepted_at, :datetime
    add_column :bookings, :declined_at, :datetime

    change_column_default :bookings, :paid, from: nil, to: false
  end
end

