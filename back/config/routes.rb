Rails.application.routes.draw do
  post   "sessions", to: "sessions#create" # ログイン処理(SessionsController#create)
  delete "sessions", to: "sessions#destroy" # ログアウト処理(SessionsController#destroy)

  namespace :api, defaults: { format: :json } do #front/src/app/test-apiの"http://localhost:3050/api/"
    get :ping, to: "ping#index"

    resources :adventure_records, only: [:create, :index] #create:記録作成、index:記録一覧の取得
    get "total_record", to: "total_records#show"
  end

  
  namespace :api do
    # 記録ページ用
    get "runs/stats", to: "runs#stats" # 集計（最新＋累計）
    get "runs", to: "runs#index" # リスト表示用
    # ドライブ中画面用
    get "quests", to: "quests#index" # クエスト選択
    get "/ping", to: "ping#index"
    get "/tourist_spots", to: "tourist_spots#index"
  end
  
end



