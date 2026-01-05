def stripe_key_from_dotenv
  return nil if Rails.env.production?

  dotenv_path = Rails.root.join("..", ".env")
  return nil unless File.exist?(dotenv_path)

  File.foreach(dotenv_path) do |line|
    next if line.strip.empty? || line.lstrip.start_with?("#")

    match = line.match(/\A\s*(?:export\s+)?STRIPE_SECRET_KEY\s*=\s*(.+?)\s*\z/)
    next unless match

    value = match[1].to_s.strip
    value = value.sub(/\A['"]/, "").sub(/['"]\z/, "")
    return value.presence
  end

  nil
end

Stripe.api_key =
  ENV["STRIPE_SECRET_KEY"].presence ||
  Rails.application.credentials.dig(:stripe, :secret_key).presence ||
  stripe_key_from_dotenv
