# app/controllers/tourist_spots_controller.rb
class TouristSpotsController < ApplicationController
  def index
    spots = [
      { id: 1, name: "北海道神宮", lat: 43.06417, lng: 141.34694 },
      { id: 2, name: "小樽運河", lat: 43.1907, lng: 141.0105 },
      { id: 3, name: "札幌時計台", lat: 43.0621, lng: 141.3545 }
    ]
    render json: spots
  end
end
