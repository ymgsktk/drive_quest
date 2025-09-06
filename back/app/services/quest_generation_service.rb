require "json"
require "set"

class QuestGenerationService
  FALLBACK_QUESTS = [
    { description: "2km進む",       point: 30 },
    { description: "神社に行く",     point: 50 },
    { description: "ご飯を食べる",   point: 40 },
    { description: "橋を渡る",       point: 20 },
    { description: "公園で写真を撮る", point: 25 },
    { description: "川沿いを1km歩く", point: 35 }
  ].freeze

  def initialize(
    model:   ENV.fetch("QUEST_GEN_MODEL", "gpt-4o-mini"),
    temp:    ENV.fetch("QUEST_TEMP", "1.2").to_f,
    top_p:   ENV["QUEST_TOP_P"]&.to_f,
    locale:  ENV.fetch("QUEST_LANG", "ja"),
    timeout: ENV.fetch("OPENAI_TIMEOUT", "20").to_i
  )
    @model   = model
    @temp    = temp
    @top_p   = top_p
    @locale  = locale
    @timeout = timeout
  end

  # 既存説明(ng_set)と今回生成分の重複を避けつつ、need件をできる限り集める
  # 最大3トライで不足分を追加生成。失敗時はフォールバックから補充。
  def generate_unique(need:, ng_set:)
    pool = []
    tries = 0

    while pool.size < need && tries < 3
      batch = generate_once(count: need - pool.size, exclude: ng_set.to_a + pool.map { |h| h[:description] })
      batch.each do |q|
        pool << q if unique_in?(q[:description], ng_set, pool)
      end
      tries += 1
    end

    if pool.size < need
      fallback = fallback_unique(need - pool.size, ng_set, pool)
      pool.concat(fallback)
    end

    pool.first(need)
  rescue => e
    warn "[QuestGen][ERROR] #{e.class}: #{e.message}"
    # すべてフォールバック
    fallback_unique(need, ng_set, [])
  end

  private

  def unique_in?(desc, ng_set, pool)
    dn = norm(desc)
    return false if dn.empty?
    return false if ng_set.any? { |s| norm(s) == dn }
    return false if pool.any? { |h| norm(h[:description]) == dn }
    true
  end

  def norm(str)
    str.to_s.unicode_normalize(:nfkc).gsub(/[[:space:]]+/, "").delete("。．.")
  end

  # 1回分のAI生成
  def generate_once(count:, exclude:)
    require "openai"
    client = OpenAI::Client.new(api_key: ENV["OPENAI_API_KEY"], timeout: @timeout)

    # NGリストを短くする（プロンプト肥大防止）
    trimmed_exclude = exclude.uniq.first(200)

    prompt = <<~PROMPT
      あなたはドライブ探検アプリのクエスト設計者です。出力は必ず#{@locale}。


      # 厳守
      - 件数は正確に #{count} 件。
      - 各クエストは全角10文字±3の短文。
      - ドライブ要素を必ず入れる。全体の半分以上は「走行で達成できる通過/経路/距離系」。
      - 停車後タスク（撮影/参拝/購入など）は「駐車後」を前提。
      - 同義・語尾違い・類似は全体で1件まで。多様性重視。
      - pointは10〜100の整数。難しいほど高い。
      - 次の説明文(除外リスト)と重複・言い換え・ごく近い表現を避けること：
        #{trimmed_exclude.map { |d| "- #{d}" }.join("\n")}

      例(形式のみの参考): 「橋を渡る」「海沿いを走る」「3km進む」「トンネル通過」「高速に乗る」「右折と直進のみで移動」「神社に行って鳥居で一礼」「カフェで休憩」「面白い看板を撮影」など
    PROMPT

    schema = {
      type: "object",
      properties: {
        quests: {
          type: "array",
          minItems: count,
          maxItems: count,
          items: {
            type: "object",
            properties: {
              description: { type: "string" },
              point:       { type: "integer", minimum: 10, maximum: 100 }
            },
            required: %w[description point],
            additionalProperties: false
          }
        }
      },
      required: ["quests"],
      additionalProperties: false
    }

    resp = client.responses.create(
      model: @model,
      input: [
        { role: :system, content: "Return only valid structured data. No extra text." },
        { role: :user,   content: prompt }
      ],
      temperature: @temp,
      top_p: @top_p,
      text: {
        format: {
          type: :json_schema,
          name: "QuestList",
          strict: true,
          schema: schema
        }
      }
    )

    contents = resp.output.flat_map { _1.content }
    text_obj = contents.grep(OpenAI::Models::Responses::ResponseOutputText).first
    data     = text_obj&.parsed || JSON.parse(text_obj&.text || "{}")
    quests   = Array(data["quests"]).map do |h|
      { description: h["description"].to_s.strip, point: h["point"].to_i.clamp(10, 100) }
    end
    quests
  end

  def fallback_unique(need, ng_set, pool)
    uniq = []
    FALLBACK_QUESTS.shuffle.each do |q|
      break if uniq.size >= need
      uniq << q if unique_in?(q[:description], ng_set, pool + uniq)
    end
    # なお不足なら適当にプレースホルダ（最終手段）
    while uniq.size < need
      desc = "走行#{rand(2..5)}km進む"
      q = { description: desc, point: rand(20..80) }
      uniq << q if unique_in?(q[:description], ng_set, pool + uniq)
    end
    uniq
  end
end
