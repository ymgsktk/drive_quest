Rails.application.routes.draw do
  namespace :api do
    get "/ping", to: "ping#index"
    get "/tourist_spots", to: "tourist_spots#index"
  end
end



