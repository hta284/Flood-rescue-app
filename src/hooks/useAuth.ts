import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { LoginCredentials } from '../types/auth.types';
import { useAuthContext } from '../contexts/AuthContext';
import axios from 'axios';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login: contextLogin, logout: contextLogout, user, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      
      if (response.success && response.data) {
        const { accessToken, refreshToken, user } = response.data;
        contextLogin(user, accessToken, refreshToken, !!credentials.rememberMe);
        navigate('/rescue/step1');
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const errorData = err.response.data;
        if (errorData.error === 'UNAUTHORIZED') {
          setError('Số điện thoại hoặc mật khẩu không chính xác.');
        } else if (errorData.error === 'ACCOUNT_BANNED') {
          setError('Tài khoản của bạn đã bị khóa.');
        } else {
          setError('Đã xảy ra lỗi. Vui lòng thử lại sau.');
        }
      } else {
        setError('Lỗi kết nối mạng. Vui lòng kiểm tra lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    contextLogout();
    navigate('/login');
  };

  return { user, isAuthenticated, isLoading, error, login, logout };
};
