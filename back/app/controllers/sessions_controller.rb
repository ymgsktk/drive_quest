class SessionsController < ApplicationController
  def new
  end

  def create
    user = User.find_or_create_by(name: params[:name])
    render json: { user_id: user.id, name: user.name }
  end

  def destroy
  end
end
