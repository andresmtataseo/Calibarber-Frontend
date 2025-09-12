// Interfaces para las DTOs de autenticación

// Request DTOs
export interface SignInRequestDto {
  email: string;
  password: string;
}

export interface SignUpRequestDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
}

export interface ChangePasswordRequestDto {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequestDto {
  email: string;
}

export interface ResetPasswordRequestDto {
  token: string;
  newPassword: string;
}

// Response DTOs
export interface AuthResponseDto {
  token: string;
  user: UserDto;
}

export interface CheckAuthResponseDto {
  user: UserDto;
  isAuthenticated: boolean;
}

export interface UserDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// Generic API Response wrapper
export interface ApiResponseDto<T = any> {
  status: number;
  message: string;
  timestamp: string;
  path: string;
  data?: T;
}

// Auth state interface for the service
export interface AuthState {
  isAuthenticated: boolean;
  user: UserDto | null;
  token: string | null;
}
