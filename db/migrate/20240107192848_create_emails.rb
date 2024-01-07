class CreateEmails < ActiveRecord::Migration[7.1]
  def change
    create_table :emails do |t|
      t.integer :uid
      t.text :title
      t.text :sender
      t.timestamp :date
      t.text :htmlbody
      t.integer :read
      t.float :read_progress

      t.timestamps
    end
  end
end
