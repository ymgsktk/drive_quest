class CreateAdventureRecords < ActiveRecord::Migration[8.0]
  def change
    create_table :adventure_records do |t|
      t.references :user, null: false, foreign_key: true
      t.integer :points
      t.integer :completed_quests_count
      t.float :distance
      t.json :visited_prefectures # 消去済み
      t.integer :visited_prefecture_count # 消去済み

      t.timestamps
    end
  end
end
