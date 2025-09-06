class AddUniqueIndexToQuestsDescription < ActiveRecord::Migration[8.0]
  def change
    # TEXT だとキー長が必要、VARCHAR(191) に変更
    change_column :quests, :description, :string, limit: 191

    add_index :quests, :description, unique: true
  end
end
