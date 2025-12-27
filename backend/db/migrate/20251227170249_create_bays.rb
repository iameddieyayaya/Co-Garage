class CreateBays < ActiveRecord::Migration[7.1]
  def change
    create_table :bays do |t|
      t.references :shop, null: false, foreign_key: true
      t.decimal :hourly_rate
      t.text :description
      t.boolean :available

      t.timestamps
    end
  end
end
