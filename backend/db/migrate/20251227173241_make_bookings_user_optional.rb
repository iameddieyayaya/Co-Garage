class MakeBookingsUserOptional < ActiveRecord::Migration[7.1]
  def change
    change_column_null :bookings, :user_id, true
  end
end
