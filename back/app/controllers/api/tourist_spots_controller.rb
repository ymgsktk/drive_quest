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

      # スポット情報作成
      spots = data['results'].each_with_index.map do |place, index|
        {
          id: index + 1,
          name: place['name'],
          description: "ここは #{place['name']} です。観光名所として有名です。",
          url: "https://www.google.com/maps/place/?q=place_id:#{place['place_id']}",
          image: place['photos']&.first ? "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=#{place['photos'].first['photo_reference']}&key=#{api_key}" : "https://placehold.co/100x100/A0AEC0/ffffff?text=Image"
        }
      end

      render json: spots
    end
  end
end
