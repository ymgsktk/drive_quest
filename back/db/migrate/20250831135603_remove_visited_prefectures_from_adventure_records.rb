class RemoveVisitedPrefecturesFromAdventureRecords < ActiveRecord::Migration[8.0]
  def change
    remove_column :adventure_records, :visited_prefectures, :json
    remove_column :adventure_records, :visited_prefecture_count, :integer
    remove_column :total_records, :total_visited_prefectures, :json
    remove_column :total_records, :total_visited_prefecture_count, :integer
  end
end
