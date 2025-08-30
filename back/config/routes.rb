Rails.application.routes.draw do
  namespace :api do
    get :ping, to: 'ping#index'
  end
end

Rails.application.routes.draw do
  namespace :api do
    resources :tourist_spots, only: [:index]
  end
end


