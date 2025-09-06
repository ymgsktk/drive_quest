module Api
  class AdventureRecordsController < ApplicationController
    before_action :set_current_user

    def create
      ActiveRecord::Base.transaction do
        attrs = normalized_params

        # 入力の丸め・デフォルト
        points    = attrs[:points].to_i                     # total_points を1回の冒険のポイントとして扱う
        completed = attrs[:completed_quests].to_i           # quest_count
        distance  = (attrs[:distance].to_f).round(2)        # km 小数第2位に丸め
        started   = attrs[:started_at]                      # 送られてくれば使うが必須ではない
        ended     = attrs[:ended_at]                        # 今回は endedAt を使わない想定なので nil のままでOK

        adventure = @current_user.adventure_records.create!(
          points: points,
          completed_quests: completed,
          distance: distance,
          started_at: started,
          ended_at: ended
        )

        total = @current_user.total_record || @current_user.build_total_record(
          total_points: 0, total_completed_quests: 0, total_distance: 0.0
        )
        total.total_points           = total.total_points.to_i + points
        total.total_completed_quests = total.total_completed_quests.to_i + completed
        total.total_distance         = (total.total_distance.to_f + distance).round(2)
        total.save!

        render json: {
          adventure: adventure,  # そのまま返してもOK（フロントで必要なら整形しても良い）
          total: total
        }, status: :created
      end
    rescue ActiveRecord::RecordInvalid => e
      render json: { error: e.record.errors.full_messages }, status: :unprocessable_entity
    end

    def index
      adventures = @current_user.adventure_records.order(created_at: :desc)
      render json: adventures
    end

    private

    # X-User-Id が無ければ adventure_result.user（= ユーザー名）でフォールバック
    # 無ければ作成（ハッカソンの簡易運用）
    def set_current_user
      if (uid = request.headers["X-User-Id"]).present?
        @current_user = User.find_by(id: uid)
      end

      if @current_user.nil?
        uname = params.dig(:adventure_result, :user) ||
                params[:user] ||
                params.dig(:adventure_record, :username) ||
                params[:username]
        if uname.present?
          @current_user = User.find_or_create_by!(name: uname)
        end
      end

      render(json: { error: "Unauthorized" }, status: :unauthorized) and return unless @current_user
    end

    # フロントの payload を後方互換で吸収
    #
    # 受け口:
    # { adventure_result: { total_points, user, distance, quest_count } }
    # { adventure_record: { points, completed_quests, distance, started_at, ended_at } }
    # 旧: トップレベルに { points, completedQuests, distanceKm, endedAt }
    def normalized_params
      if params[:adventure_result].is_a?(ActionController::Parameters)
        ar = params[:adventure_result]
        {
          points:            ar[:total_points],
          completed_quests:  ar[:quest_count],
          distance:          ar[:distance],
          started_at:        parse_time(ar[:started_at] || ar[:startedAt]),
          ended_at:          parse_time(ar[:ended_at]   || ar[:endedAt])
        }
      elsif params[:adventure_record].is_a?(ActionController::Parameters)
        ar = params[:adventure_record]
        {
          points:            ar[:points],
          completed_quests:  ar[:completed_quests] || ar[:completedQuests],
          distance:          ar[:distance] || ar[:distance_km] || ar[:distanceKm],
          started_at:        parse_time(ar[:started_at] || ar[:startedAt]),
          ended_at:          parse_time(ar[:ended_at]   || ar[:endedAt])
        }
      else
        {
          points:            params[:points],
          completed_quests:  params[:completed_quests] || params[:completedQuests],
          distance:          params[:distance] || params[:distance_km] || params[:distanceKm],
          started_at:        parse_time(params[:started_at] || params[:startedAt]),
          ended_at:          parse_time(params[:ended_at]   || params[:endedAt])
        }
      end
    end

    def parse_time(v)
      return nil if v.blank?
      Time.zone.parse(v) rescue nil
    end
  end
end