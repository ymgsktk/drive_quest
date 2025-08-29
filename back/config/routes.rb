Rails.application.routes.draw do
  get "sessions/new"
  get "sessions/create"
  get "sessions/destroy"
  namespace :api do
    get :ping, to: 'ping#index'
  end
end


