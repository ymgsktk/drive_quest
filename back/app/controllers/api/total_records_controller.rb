# ユーザーの全記録
module Api
  class TotalRecordsController < ApplicationController
    before_action :set_current_user

    def show
      total = @current_user.total_record
      render json: total || { total_points: 0, total_completed_quests: 0, total_distance: 0 }
    end

    private
    def set_current_user
      @current_user = User.find_by(id: request.headers["X-User-Id"])
      render json: { error: "Unauthorized" }, status: :unauthorized unless @current_user
    end
  end
end
