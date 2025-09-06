class AddUniqueIndexOnAdventureRecordsUserIdEndedAt < ActiveRecord::Migration[8.0]
  def change
    add_index :adventure_records, [:user_id, :ended_at],
              unique: true,
              name: "idx_adventure_records_user_ended_at"
  end
end
