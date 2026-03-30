import { axiosInstance } from './api';
import { LoginCredentials, LoginResponse, RegisterRequest, RegisterResponse } from '../types/auth.types';

const API_URL = '/auth';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>(`${API_URL}/login`, {
      phone: credentials.phone,
      password: credentials.password,
    });
    return response.data;
  },
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await axiosInstance.post<RegisterResponse>(`${API_URL}/register`, data);
    return response.data;
  },
};
