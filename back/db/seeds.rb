# # This file should ensure the existence of records required to run the application in every environment (production,
# # development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# # The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
# #
# # Example:
# #
# #   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
# #     MovieGenre.find_or_create_by!(name: genre_name)
# #   end
# #Quest.find_or_create_by!(description: "2km進む")   { |q| q.point = 30 }
# #Quest.find_or_create_by!(description: "神社に行く") { |q| q.point = 50 }
# #Quest.find_or_create_by!(description: "ご飯を食べる") { |q| q.point = 40 }

# # frozen_string_literal: true
# require "json"

# USE_AI  = ENV.fetch("USE_AI_FOR_SEEDS", "true") == "true"
# MODEL   = ENV.fetch("QUEST_GEN_MODEL", "gpt-4o-mini") # 好みで "gpt-4o-mini" などに
# COUNT   = ENV.fetch("QUEST_GEN_COUNT", "5").to_i           # 生成する件数
# LOCALE  = ENV.fetch("QUEST_LANG", "ja")                     # "ja" 固定でOK
# TEMP  = ENV.fetch("QUEST_TEMP",  "1.2").to_f    # 0.7〜1.1 くらい推奨
# TOPP  = ENV["QUEST_TOP_P"]&.to_f                # 使わなければ nil のまま


# # ===== フォールバック（AIを使わない/失敗時） =====
# FALLBACK_QUESTS = [
#   { description: "2km進む",   point: 30 },
#   { description: "神社に行く", point: 50 },
#   { description: "ご飯を食べる", point: 40 },
#   { description: "橋を渡る", point: 20 },
#   { description: "公園で写真を撮る", point: 25 },
#   { description: "川沿いを1km歩く", point: 35 }
# ]

# def upsert_quests!(quests)
#   quests.each do |q|
#     desc  = q[:description] || q["description"]
#     point = (q[:point] || q["point"] || 20).to_i.clamp(5, 200)

#     next if desc.to_s.strip.empty?

#     Quest.find_or_create_by!(description: desc.strip) do |rec|
#       rec.point = point
#       # 将来カラムを増やしたらここで安全に代入
#       rec.category   = q["category"]   if rec.respond_to?(:category=)   && q["category"]
#       rec.difficulty = q["difficulty"] if rec.respond_to?(:difficulty=) && q["difficulty"]
#       rec.tags       = q["tags"]       if rec.respond_to?(:tags=)       && q["tags"]
#     end
#   end
# end

# def ai_generate_quests!(count:, locale:)
#   require "openai"

#   client = OpenAI::Client.new(api_key: ENV["OPENAI_API_KEY"])
#   raise "OPENAI_API_KEY missing" if client.nil? || ENV["OPENAI_API_KEY"].to_s.empty?

#   categories = %w[移動 参拝 自然 文化 休憩 食事 撮影 学び]
#   prompt = <<~PROMPT
#   あなたはドライブ探検アプリのクエスト設計者です。
#   出力は必ず#{locale}。

#   # 厳守ルール
#   - 各クエストは全角10文字±3の短文。
#   - ドライブ要素を必ず入れる。全体の半分以上は「走行で達成できる通過/経路/距離系」（例：橋を渡る・海沿いを走る・3km進む・トンネル通過）。
#   - 停車後に行うタスク（例：一礼・読む・撮る）は必ず「停車・駐車後」を前提とする。運転中の操作や注意喚起文は不可。（例：カフェに入る・神社に行く）。
#   - 同義・語尾違い・近い意味（公園/散歩/散策/景色…）は全体で1件まで。内容の多様性を優先。
#   - ポイントは10〜100の整数。手間が増えるほど高め。
#   - 生成数は#{COUNT}件。重複禁止。

# PROMPT


#   schema = {
#     type: "object",
#     properties: {
#       quests: {
#         type: "array",
#         minItems: COUNT,
#         maxItems: COUNT,
#         items: {
#           type: "object",
#           properties: {
#             description: { type: "string" },
#             point:       { type: "integer", minimum: 10, maximum: 100 }
#           },
#           required: %w[description point],
#           additionalProperties: false
#         }
#       }
#     },
#     required: ["quests"],
#     additionalProperties: false
#   }

#   # --- 生成部：client.responses.create(...) をこの形に ---
#   response = client.responses.create(
#     model: MODEL,
#     input: [
#       { role: :system, content: "Return only valid structured data. No explanations." },
#       { role: :user,   content: prompt }
#     ],
#     temperature: TEMP,
#     top_p: TOPP,
#     text: {
#       format: {
#         type: :json_schema,
#         name: "QuestList",
#         strict: true,
#         schema: schema
#       }
#     }
#   )


#   # 公式SDKのResponses出力から構造化データを取得（parsedを優先）
#   contents = response.output.flat_map { _1.content }
#   text_obj = contents.grep(OpenAI::Models::Responses::ResponseOutputText).first
#   data     = text_obj&.parsed || JSON.parse(text_obj&.text || "{}")
#   quests   = (data["quests"] || []).map { |h| h.transform_keys!(&:to_sym) }

#   raise "Empty quests" if quests.empty?
#   quests
# end

# begin
#   if USE_AI
#     puts "[seeds] Generating quests with AI (model=#{MODEL}, count=#{COUNT})..."
#     quests = ai_generate_quests!(count: COUNT, locale: LOCALE)
#     upsert_quests!(quests)
#   else
#     puts "[seeds] USE_AI_FOR_SEEDS=false -> using fallback quests"
#     upsert_quests!(FALLBACK_QUESTS)
#   end
# rescue => e
#   warn "[seeds][AI ERROR] #{e.class}: #{e.message}"
#   warn "[seeds] Falling back to static quests."
#   upsert_quests!(FALLBACK_QUESTS)
# end

# puts "[seeds] Quest count: #{Quest.count}"
