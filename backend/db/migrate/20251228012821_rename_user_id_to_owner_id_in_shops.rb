class RenameUserIdToOwnerIdInShops < ActiveRecord::Migration[7.1]
  def change
    rename_column :shops, :user_id, :owner_id
  end
end