class CreateTotalRecords < ActiveRecord::Migration[8.0]
  def change
    create_table :total_records do |t|
      t.references :user, null: false, foreign_key: true
      t.integer :total_points
      t.integer :total_completed_quests
      t.float :total_distance
      t.json :total_visited_prefectures # 消去済み
      t.integer :total_visited_prefecture_count # 消去済み

      t.timestamps
    end
  end
end
