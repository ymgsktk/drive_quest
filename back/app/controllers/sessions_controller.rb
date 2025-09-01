class SessionsController < ApplicationController
  def new
  end

  def create
    user = User.find_or_create_by(name: params[:name]) # ユーザー名を検索or作成
    render json: { user_id: user.id, name: user.name }
  end

  def destroy
    render json: { message: "ログアウトしました" }
  end
end
