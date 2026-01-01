Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      get "shops/current", to: "shops#current"
      post 'auth/login', to: 'auth#login'
      post 'auth/register', to: 'auth#register'
      get 'auth/me', to: 'auth#me'
      resources :bays, only: [:create, :index, :show]
      resources :users, only: [:create]
    end
  end
end

