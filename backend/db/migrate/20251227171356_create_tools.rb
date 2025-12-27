class CreateTools < ActiveRecord::Migration[7.1]
  def change
    create_table :tools do |t|
      t.references :shop, null: false, foreign_key: true
      t.string :name
      t.text :description
      t.decimal :hourly_rate
      t.boolean :available

      t.timestamps
    end
  end
end
