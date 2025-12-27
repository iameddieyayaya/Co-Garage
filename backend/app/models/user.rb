class User < ApplicationRecord
  has_secure_password

  enum role: { owner: 0 }

  validates :name, presence: true
  validates :email, presence: true, uniqueness: true
  validates :role, presence: true, inclusion: { in: roles.keys }
end
