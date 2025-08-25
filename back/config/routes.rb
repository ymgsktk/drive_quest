Rails.application.routes.draw do
  namespace :api do
    get :ping, to: 'ping#index'
  end
end


