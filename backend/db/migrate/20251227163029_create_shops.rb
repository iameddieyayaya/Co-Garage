class CreateShops < ActiveRecord::Migration[7.1]
  def change
    create_table :shops do |t|
      t.references :user, null: false, foreign_key: true
      t.string :name
      t.string :location
      t.text :description

      t.timestamps
    end
  end
end
