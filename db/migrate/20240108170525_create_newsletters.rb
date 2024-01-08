class CreateNewsletters < ActiveRecord::Migration[7.1]
  def change
    create_table :newsletters do |t|
      t.text :name
      t.text :sender

      t.timestamps
    end
  end
end
