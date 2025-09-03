class CreateUsers < ActiveRecord::Migration[8.0]
  def change
    create_table :users do |t|
      t.string :name, null: false, unique: true

      t.timestamps
    end
    
    add_index :users, :name, unique: true
  end
end
