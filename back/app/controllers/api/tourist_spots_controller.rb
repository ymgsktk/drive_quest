class TouristSpotsController < ApplicationController
  def index
    spots = [
      { name: "札幌時計台", lat: 43.0621, lng: 141.3544 },
      { name: "大通公園", lat: 43.0629, lng: 141.3543 }
    ]
    render json: { tourist_spots: spots }
  end
end
