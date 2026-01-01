class User < ApplicationRecord
  has_secure_password
  has_one :shop, foreign_key: :owner_id, dependent: :destroy


  enum role: {
    shop_owner: 0
  }
  
  validates :email, presence: true, uniqueness: { case_sensitive: false }
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, length: { minimum: 6 }, if: -> { new_record? || !password.nil? }
end
