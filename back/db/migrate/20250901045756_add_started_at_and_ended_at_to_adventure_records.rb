class AddStartedAtAndEndedAtToAdventureRecords < ActiveRecord::Migration[8.0]
  def change
    add_column :adventure_records, :started_at, :datetime
    add_column :adventure_records, :ended_at, :datetime
  end
end
