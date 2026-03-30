export interface User {
  id: string;
  fullName: string;
  phone: string;
  role: string;
  status?: string;
}

export interface RegisterRequest {
  fullName: string;
  phone: string;
  email?: string;
  password: string;
  role: 'CITIZEN' | 'RESCUE_TEAM';
}

export interface RegisterResponse {
  success: boolean;
  data?: User;
  error?: string;
}

export interface LoginResponse {
  success: boolean;
  data?: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
  error?: string;
}

export interface LoginCredentials {
  phone: string;
  password: string;
  rememberMe?: boolean;
}
