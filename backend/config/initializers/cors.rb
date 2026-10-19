require "uri"

allowed_origin = if Rails.env.production?
  URI.parse(ENV.fetch("FRONTEND_BASE_URL")).origin
else
  "*"
end

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins allowed_origin
    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head]
  end
end

