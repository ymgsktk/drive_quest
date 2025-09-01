class RenameCompletedQuestsCountInAdventureRecords < ActiveRecord::Migration[8.0]
  def change
    rename_column :adventure_records, :completed_quests_count, :completed_quests
  end
end
