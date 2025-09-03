#フロント記録用ページに送るAPIコントローラー

require "base64"
require "json"

module Api
  class RunsController < ApplicationController

    # GET /api/runs/stats?username=nttdata_001
    def stats
      user = User.find_by(name: params[:username])
      return render json: { error: "User not found" }, status: :not_found unless user

      latest = user.adventure_records.order(created_at: :desc).first
      total  = user.total_record

      render json: {
        latest: latest ? {
          id: latest.id,
          distance: latest.distance,
          points: latest.points,
          completedQuests: latest.completed_quests
        } : nil,
        totals: {
          distance: total&.total_distance.to_f,            # nilなら0.0
          points: total&.total_points.to_i,                # nilなら0
          completedQuests: total&.total_completed_quests.to_i
        }
      }
    end

    # GET /api/runs?username=nttdata_001&limit=20&cursor=...
    def index
      user = User.find_by(name: params[:username])
      return render json: { error: "User not found" }, status: :not_found unless user

      limit  = [[params[:limit].to_i, 1].max, 100].min rescue 20
      limit  = 20 if limit.zero?
      cursor = params[:cursor].presence

      scope = user.adventure_records
                  .select(:id, :distance, :points, :completed_quests, :created_at)
                  .order(created_at: :desc, id: :desc)

      if cursor
        begin
          payload = JSON.parse(Base64.strict_decode64(cursor))
          ts = Time.iso8601(payload["created_at"])
          last_id = payload["id"].to_i
          # created_at, id の複合キーで “この続き” を取得
          scope = scope.where("created_at < ? OR (created_at = ? AND id < ?)", ts, ts, last_id)
        rescue
          return render json: { error: "Invalid cursor" }, status: :bad_request
        end
      end

      rows = scope.limit(limit + 1).to_a  # 1件多めに取って next の有無判定
      has_more = rows.length > limit
      rows = rows.first(limit)

      items = rows.map { |r|
        {
          id: r.id,
          distance: r.distance,
          points: r.points,
          completedQuests: r.completed_quests? ? r.completed_quests : r.completed_quests # guard if typo ever
        }.transform_keys! { _1 } # no-op; keeps clarity
      }

      next_cursor = nil
      if has_more
        last = rows.last
        next_cursor = Base64.strict_encode64({ id: last.id, created_at: last.created_at.iso8601 }.to_json)
      end

      render json: { items:, nextCursor: next_cursor }
    end
  end
end
