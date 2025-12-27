class CreateBookingTools < ActiveRecord::Migration[7.1]
  def change
    create_table :booking_tools do |t|
      t.references :booking, null: false, foreign_key: true
      t.references :tool, null: false, foreign_key: true
      t.integer :quantity

      t.timestamps
    end
  end
end
