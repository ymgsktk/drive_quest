class ApplicationController < ActionController::API
    private

  def current_user
    @current_user ||= User.find_by(id: request.headers["X-User-Id"])
  end
end
