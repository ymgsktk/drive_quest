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

      url = URI("https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=#{lat},#{lng}&radius=#{radius}&type=tourist_attraction&key=#{api_key}")

      response = Net::HTTP.get(url)
      data = JSON.parse(response)

      spots = data['results'].map do |place|
        {
          name: place['name'],
          lat: place['geometry']['location']['lat'],
          lng: place['geometry']['location']['lng']
        }
      end

      render json: { tourist_spots: spots }
    end
  end
end
