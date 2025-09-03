# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end
Quest.find_or_create_by!(description: "2km進む")   { |q| q.point = 30 }
Quest.find_or_create_by!(description: "神社に行く") { |q| q.point = 50 }
Quest.find_or_create_by!(description: "ご飯を食べる") { |q| q.point = 40 }