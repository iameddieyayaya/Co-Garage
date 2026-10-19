require "active_support/core_ext/integer/time"
require "uri"

Rails.application.configure do
  config.cache_classes = true
  config.eager_load = true
  config.consider_all_requests_local = false
  config.public_file_server.enabled = ENV["RAILS_SERVE_STATIC_FILES"].present?
  config.active_support.deprecation = :notify
  config.log_formatter = ::Logger::Formatter.new
  config.log_level = :info

  frontend_uri = URI.parse(ENV.fetch("FRONTEND_BASE_URL"))
  config.action_mailer.default_url_options = { host: frontend_uri.host, protocol: frontend_uri.scheme }
  unless frontend_uri.is_a?(URI::HTTPS) && frontend_uri.host.present?
    raise ArgumentError, "FRONTEND_BASE_URL must be an HTTPS origin in production"
  end
  config.action_mailer.delivery_method = :smtp
  config.action_mailer.perform_deliveries = ENV["SMTP_ADDRESS"].present?
  config.action_mailer.raise_delivery_errors = false

  if ENV["SMTP_ADDRESS"].present?
    config.action_mailer.smtp_settings = {
      address: ENV["SMTP_ADDRESS"],
      port: ENV.fetch("SMTP_PORT", "587").to_i,
      domain: ENV["SMTP_DOMAIN"],
      user_name: ENV["SMTP_USERNAME"],
      password: ENV["SMTP_PASSWORD"],
      authentication: ENV.fetch("SMTP_AUTH", "plain"),
      enable_starttls_auto: ENV.fetch("SMTP_STARTTLS", "true") == "true"
    }.compact
  end
end
