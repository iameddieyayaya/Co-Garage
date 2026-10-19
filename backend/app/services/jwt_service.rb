class JwtService
  SECRET_KEY =
    Rails.application.credentials.secret_key_base.presence ||
    ENV["SECRET_KEY_BASE"].presence ||
    ("development_secret_key_change_in_production" unless Rails.env.production?)

  raise "SECRET_KEY_BASE or credentials secret_key_base must be configured" if SECRET_KEY.blank?

  def self.encode(payload, exp = 24.hours.from_now)
    payload[:exp] = exp.to_i
    JWT.encode(payload, SECRET_KEY)
  end

  def self.decode(token)
    decoded = JWT.decode(token, SECRET_KEY)[0]
    HashWithIndifferentAccess.new(decoded)
  rescue JWT::DecodeError => e
    nil
  end
end
