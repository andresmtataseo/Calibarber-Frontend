export interface AppointmentResponse {
  appointmentId: string;
  barberId: string;
  userId: string;
  serviceId: string;
  appointmentDateTime: string;
  durationMinutes: number;
  price: number;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  barber: BarberInfo;
  user: UserInfo;
  service: ServiceInfo;
}

export interface CreateAppointmentRequest {
  barberId: string;
  userId: string;
  serviceId: string;
  appointmentDateTime: string;
  durationMinutes: number;
  price: number;
  status?: AppointmentStatus;
  notes?: string;
}

export interface UpdateAppointmentRequest {
  appointmentDateTime?: string;
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

// Interfaces para el endpoint de disponibilidad
export interface AvailabilityResponse {
  availability: DayAvailability[];
}

export interface DayAvailability {
  date: string; // ISO date format: yyyy-MM-dd
  status: AvailabilityStatus;
}

export enum AvailabilityStatus {
  LIBRE = 'LIBRE',
  PARCIALMENTE_DISPONIBLE = 'PARCIALMENTE_DISPONIBLE',
  SIN_DISPONIBILIDAD = 'SIN_DISPONIBILIDAD'
}

export interface DayAvailabilityResponse {
  date: string; // ISO date format: yyyy-MM-dd
  slots: DayAvailabilitySlot[];
}

export interface DayAvailabilitySlot {
  time: string; // ISO time format: HH:mm:ss
  available: boolean;
}

// Interfaces para el endpoint de disponibilidad de barberos con tiempo libre
export interface BarbersAvailabilityResponse {
  dateTime: string; // ISO LocalDateTime format: yyyy-MM-dd'T'HH:mm:ss
  barbers: BarberAvailability[];
}

export interface BarberAvailability {
  id: string;
  name: string;
  available: boolean;
  freeMinutes: number;
}
