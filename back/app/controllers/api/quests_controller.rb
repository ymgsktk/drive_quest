# フロントにクエストを二つ送るAPIコントローラー

module Api
  class QuestsController < ApplicationController
    def index
      limit = (params[:limit] || 2).to_i.clamp(1, 10) # デフォ2件、上限10件
      # AND() でランダムで抽出
      quests = Quest.order(Arel.sql("RAND()")).limit(limit)

      items = quests.map { |q|
        {
          id: q.id,
          title: q.description, # ← 既存列descriptionをtitleとして返す
          points: q.point       # ← 既存列pointをpointsとして返す
        }
      }

      render json: { items: items }
    end
  end
end