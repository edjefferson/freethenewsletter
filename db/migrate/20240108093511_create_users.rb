class CreateUsers < ActiveRecord::Migration[7.1]
  def change
    create_table :users do |t|
      t.text :name
      t.text :api_key
      t.timestamp :last_checked

      t.timestamps
    end
  end
end
