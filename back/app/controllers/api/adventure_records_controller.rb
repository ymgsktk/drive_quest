# 一回のドライブの記録
module Api
  class AdventureRecordsController < ApplicationController
    before_action :set_current_user

    def create
      adventure = @current_user.adventure_records.create!(adventure_params)

      total = @current_user.total_record || @current_user.build_total_record(
        total_points: 0, total_completed_quests: 0, total_distance: 0
      )
      total.total_points           = total.total_points.to_i          + adventure.points.to_i
      total.total_completed_quests = total.total_completed_quests.to_i+ adventure.completed_quests.to_i
      total.total_distance         = total.total_distance.to_f        + adventure.distance.to_f
      total.save!

      render json: { adventure: adventure, total: total }
    rescue ActiveRecord::RecordInvalid => e
      render json: { error: e.record.errors.full_messages }, status: :unprocessable_entity
    end

    def index
      adventures = @current_user.adventure_records.order(created_at: :desc)
      render json: adventures
    end

    private
    def adventure_params
      params.require(:adventure_record)
            .permit(:points, :completed_quests, :distance, :started_at, :ended_at)
    end

    def set_current_user
      @current_user = User.find_by(id: request.headers["X-User-Id"])
      render json: { error: "Unauthorized" }, status: :unauthorized unless @current_user
    end
  end
end
