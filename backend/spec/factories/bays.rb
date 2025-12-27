FactoryBot.define do
  factory :bay do
    shop { nil }
    hourly_rate { "9.99" }
    description { "MyText" }
    available { false }
  end
end
