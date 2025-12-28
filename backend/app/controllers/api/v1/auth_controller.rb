class Api::V1::AuthController < ApplicationController
  skip_before_action :authenticate_request, only: [:login, :register]

  def login
    user = User.find_by(email: params[:email])
    
    if user && user.authenticate(params[:password])
      token = JwtService.encode({ user_id: user.id })
      render json: {
        user: { id: user.id, email: user.email, role: user.role, name: user.name },
        token: token
      }, status: :ok
    else
      render json: { error: 'Invalid credentials' }, status: :unauthorized
    end
  end

  def register
    user = User.new(user_params)
    
    if user.save
      token = JwtService.encode({ user_id: user.id })
      render json: {
        user: { id: user.id, email: user.email, role: user.role, name: user.name },
        token: token
      }, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def me
    render json: { user: { id: current_user.id, email: current_user.email, role: current_user.role, name: current_user.name } }, status: :ok
  end

  private

  def user_params
    params.require(:user).permit(:email, :password, :role, :name)
  end
end
