FactoryBot.define do
  factory :tool do
    shop { nil }
    name { "MyString" }
    description { "MyText" }
    hourly_rate { "9.99" }
    available { false }
  end
end
