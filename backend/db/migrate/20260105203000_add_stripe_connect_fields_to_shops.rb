class AddStripeConnectFieldsToShops < ActiveRecord::Migration[7.1]
  def change
    add_column :shops, :stripe_account_id, :string
    add_column :shops, :stripe_charges_enabled, :boolean, null: false, default: false
    add_column :shops, :stripe_payouts_enabled, :boolean, null: false, default: false
    add_column :shops, :stripe_details_submitted, :boolean, null: false, default: false

    add_index :shops, :stripe_account_id
  end
end

