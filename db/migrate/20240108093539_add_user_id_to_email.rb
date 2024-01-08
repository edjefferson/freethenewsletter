class AddUserIdToEmail < ActiveRecord::Migration[7.1]
  def change
    add_column :emails, :user_id, :integer
  end
end
