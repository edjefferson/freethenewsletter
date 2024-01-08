class User < ApplicationRecord
  def generate_api_key
    SecureRandom.base58(24)
  end

  def set_api_key
    self.api_key = generate_api_key
    self.save
  end
end
