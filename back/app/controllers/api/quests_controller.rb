# フロントにクエストを二つ送るAPIコントローラー
module Api
  class QuestsController < ApplicationController
    # GET /api/quests
    # 叩かれたタイミングで「未登録の説明だけで」5件生成し、そのうち3件だけをDB保存して返す
    def index
      generate_count = 5
      save_count     = 3

      # 既存説明のNGセット
      existing_descs = Quest.pluck(:description)
      ng_set = existing_descs.to_set

      generator = QuestGenerationService.new
      pool = generator.generate_unique(need: generate_count, ng_set: ng_set)

      chosen = pool.sample(save_count)

      saved = []
      ActiveRecord::Base.transaction do
        chosen.each do |q|
          # レース時の一意制約違反にも耐えるようリトライ
          begin
            rec = Quest.create!(description: q[:description].strip, point: q[:point].to_i.clamp(10, 100))
            saved << rec
          rescue ActiveRecord::RecordNotUnique, ActiveRecord::RecordInvalid
            # 既に誰かが同じ説明を入れた等 → スキップしてプールから別のを補充
            replacement = (pool - chosen).find { |cand| Quest.find_by(description: cand[:description]).nil? }
            if replacement
              rec = Quest.create!(description: replacement[:description].strip, point: replacement[:point].to_i.clamp(10, 100))
              saved << rec
            end
          end
        end

        # どうしても2件に満たない場合は、最後の手段で未保存のランダム生成分を捻出
        while saved.size < save_count
          q = pool.find { |cand| Quest.find_by(description: cand[:description]).nil? && saved.none? { |s| s.description == cand[:description] } }
          break unless q
          saved << Quest.create!(description: q[:description].strip, point: q[:point].to_i.clamp(10, 100))
        end
      end

      items = saved.first(save_count).map { |q|
        {
          id: q.id,
          title: q.description, # ← 既存列descriptionをtitleとして返す
          points: q.point       # ← 既存列pointをpointsとして返す
        }
      }

      render json: { items: items }
    rescue => e
      warn "[Quests#index][ERROR] #{e.class}: #{e.message}"
      render json: { items: [] }, status: :service_unavailable
    end
  end
end
