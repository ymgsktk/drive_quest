Rails.application.routes.draw do
  post   "sessions", to: "sessions#create"
  delete "sessions", to: "sessions#destroy"

  namespace :api, defaults: { format: :json } do
    get :ping, to: "ping#index"

    resources :adventure_records, only: [:create, :index]
    get "total_record", to: "total_records#show"

    # 記録ページ用
    get "runs/stats", to: "runs#stats"
    get "runs", to: "runs#index"

    # ドライブ中画面用
    get "quests", to: "quests#index"
    get "tourist_spots", to: "tourist_spots#index"
  end
end




