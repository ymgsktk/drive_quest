# back/app/controllers/api/tourist_spots_controller.rb
class Api::TouristSpotsController < ApplicationController
  # GET /api/tourist_spots
  def index
    # テスト用に固定データを返す
    spots = [
      { name: "札幌時計台", lat: 43.0621, lng: 141.3544 },
      { name: "大通公園", lat: 43.0629, lng: 141.3543 }
    ]

    render json: { tourist_spots: spots }
  end
end
