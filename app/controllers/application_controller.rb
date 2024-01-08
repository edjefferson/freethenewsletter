class ApplicationController < ActionController::API
  include ActionController::MimeResponds
  before_action :render_message, unless: :check_api_key

  def check_api_key
    params[:key] && User.find_by(api_key: params[:key])
  end
  
  def render_message
    render json: { message: "missing API key" }
  end
end
