module Api
  class PingController < ApplicationController
    def index
      render json: { message: "pongi" }
    end
  end
end

