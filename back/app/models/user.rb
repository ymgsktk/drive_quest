class User < ApplicationRecord
  has_many :adventure_records
  has_one :total_record
end
