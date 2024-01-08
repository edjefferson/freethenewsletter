class AddMailUserToUser< ActiveRecord::Migration[7.1]
  def change
    add_column :users, :mail_user, :text
    add_column :users, :mail_pass, :text
    add_column :users, :mail_server, :text
  end
end
