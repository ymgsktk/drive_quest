Rails.application.routes.draw do
  # セッション管理
  post   "sessions", to: "sessions#create"   # ログイン
  delete "sessions", to: "sessions#destroy"  # ログアウト

  # API グループ（すべてJSON）
  namespace :api, defaults: { format: :json } do
    
    # 動作確認
    get "/ping", to: "ping#index"

    # 記録関連
    resources :adventure_records, only: [:create, :index]
    get "total_record", to: "total_records#show"

    # 記録ページ用
    get "runs/stats", to: "runs#stats"
    get "runs", to: "runs#index"

    # ドライブ画面用
    get "quests", to: "quests#index"
    get "/tourist_spots", to: "tourist_spots#index"
  end
end




