require 'net/http'
require 'uri'
require 'json'

module Api
  class TouristSpotsController < ApplicationController
    def index
      api_key = ENV['GOOGLE_MAPS_API_KEY']
      lat = params[:lat] || 43.06417   # デフォルト：札幌
      lng = params[:lng] || 141.34694
      radius = params[:radius] || 5000 # 5km以内

      # Nearby Search API
      url = URI("https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=#{lat},#{lng}&radius=#{radius}&type=tourist_attraction&key=#{api_key}")
      response = Net::HTTP.get(url)
      data = JSON.parse(response)

      results = data['results'] || []

      # フィルタリング (評価4.0以上 & レビュー数50件以上)
      filtered_results = results.select do |place|
        place['rating'].to_f >= 4.0 && place['user_ratings_total'].to_i >= 50
      end

      # 人気順にソート (レビュー数 → 評価)
      sorted_results = filtered_results.sort_by do |place|
        [-place['user_ratings_total'].to_i, -place['rating'].to_f]
      end

      # 指定フォーマットに変換
      spots = sorted_results.each_with_index.map do |place, index|
        {
          id: index + 1,
          name: place['name'],
          description: "#{place['name']}は観光名所として知られています。",
          url: "https://www.google.com/maps/place/?q=place_id:#{place['place_id']}",
          image: place['photos']&.first ?
                   "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=#{place['photos'].first['photo_reference']}&key=#{api_key}" :
                   "https://placehold.co/100x100/A0AEC0/ffffff?text=Image"
        }
      end

      render json: spots
    end
  end
end

