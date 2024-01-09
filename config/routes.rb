Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check
  get "check_email" => "newsletter#check_email"
  get "return_unread" => "newsletter#return_unread"
  get "fetch_newsletter_list" => "newsletter#fetch_newsletter_list"
  post "update_newsletter_list" =>"newsletter#update_newsletter_list"
  post "mark_read" => "newsletter#mark_read"
  # Defines the root path route ("/")
  # root "posts#index"
end
