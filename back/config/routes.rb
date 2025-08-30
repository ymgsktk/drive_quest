Rails.application.routes.draw do
  namespace :api do
    get :ping, to: 'ping#index'
  end
end

# config/routes.rb
Rails.application.routes.draw do
  get "tourist_spots", to: "tourist_spots#index"
end



