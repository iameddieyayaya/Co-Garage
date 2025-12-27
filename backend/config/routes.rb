Rails.application.routes.draw do
  root 'home#index'

  # User auth
  get "/login", to: "sessions#new"
  post "/login", to: "sessions#create"
  delete "/logout", to: "sessions#destroy"

  # Users (Garage Owners)
  resources :users, only: [:new, :create, :show, :edit, :update]

  resources :bookings do
    post 'create_checkout_session', to: 'payments#create'
  end
end

