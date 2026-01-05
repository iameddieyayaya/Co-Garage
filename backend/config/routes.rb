Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      get "shops/current", to: "shops#current"
      resources :shops, only: [:create]
      post 'auth/login', to: 'auth#login'
      post 'auth/register', to: 'auth#register'
      get 'auth/me', to: 'auth#me'
      resources :bays, only: [:create, :index, :show]
      resources :tools, only: [:create, :index, :show]
      resources :bookings, only: [:create]

      namespace :public do
        resources :shops, only: [:index]
        resources :bays, only: [:index]
        resources :tools, only: [:index]
      end
      resources :users, only: [:create]
    end
  end
end
