class Quest < ApplicationRecord
    validates :description, presence: true, uniqueness: true
    validates :point, numericality: { only_integer: true, in: 5..200 }
end
