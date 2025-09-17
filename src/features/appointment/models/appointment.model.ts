export interface AppointmentResponse {
  appointmentId: string;
  barberId: string;
  userId: string;
  serviceId: string;
  appointmentDateTime: string; // ISO LocalDateTime format: yyyy-MM-dd'T'HH:mm:ss
  durationMinutes: number;
  price: number;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string; // ISO LocalDateTime format: yyyy-MM-dd'T'HH:mm:ss
  updatedAt: string; // ISO LocalDateTime format: yyyy-MM-dd'T'HH:mm:ss
  barber: BarberInfo;
  user: UserInfo;
  service: ServiceInfo;
}

export interface CreateAppointmentRequest {
  barberId: string;
  userId: string;
  serviceId: string;
  appointmentDateTime: string; // ISO LocalDateTime format: yyyy-MM-dd'T'HH:mm:ss
  durationMinutes: number;
  price: number; // Will be converted to BigDecimal on backend
  status?: AppointmentStatus; // Optional, defaults to SCHEDULED in backend
  notes?: string;
}

export interface UpdateAppointmentRequest {
  appointmentDateTime?: string; // ISO LocalDateTime format: yyyy-MM-dd'T'HH:mm:ss
  durationMinutes?: number;
  price?: number;
  status?: AppointmentStatus;
  notes?: string;
}

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}

export interface UserInfo {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
}

export interface BarberInfo {
  barberId: string;
  userId: string;
  firstName: string;
  lastName: string;
  specialization?: string;
}

export interface ServiceInfo {
  serviceId: string;
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
}