class AddActiveToShops < ActiveRecord::Migration[7.1]
  def change
    add_column :shops, :active, :boolean
  end
end
