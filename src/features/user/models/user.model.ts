export interface UserResponse {
  userId: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  isActive: boolean;
  profilePictureUrl?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface CreateUserRequest {
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
}

export interface UpdateUserRequest {
  email?: string;
  role?: UserRole;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  isActive?: boolean;
  profilePictureUrl?: string;
}

export interface UserCreate {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: UserRole;
  profilePictureUrl?: string;
}

export interface UserUpdate {
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role?: UserRole;
  isActive?: boolean;
  profilePictureUrl?: string;
}

export enum UserRole {
  ROLE_ADMIN = 'ROLE_ADMIN',
  ROLE_BARBER = 'ROLE_BARBER',
  ROLE_CLIENT = 'ROLE_CLIENT'
}
