require "active_support/core_ext/integer/time"

Rails.application.configure do
  config.cache_classes = true
  config.eager_load = true
  config.public_file_server.enabled = true
  config.public_file_server.headers = { "Cache-Control" => "public, max-age=3600" }
  config.consider_all_requests_local = true
  config.action_controller.perform_caching = false
  config.cache_store = :null_store
  config.action_dispatch.show_exceptions = :none
  config.active_support.deprecation = :stderr
  config.active_record.maintain_test_schema = true

  config.action_mailer.delivery_method = :test
  config.action_mailer.perform_deliveries = true
end
