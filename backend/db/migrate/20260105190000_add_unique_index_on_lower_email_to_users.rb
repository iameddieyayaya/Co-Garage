class AddUniqueIndexOnLowerEmailToUsers < ActiveRecord::Migration[7.1]
  def change
    add_index :users, "LOWER(email)", unique: true, name: "index_users_on_lower_email"
  end
end

