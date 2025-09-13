export interface BarberResponse {
  barberId: string;
  userId: string;
  barbershopId: string;
  specialization?: string;
  isActive: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface CreateBarberRequest {
  userId: string;
  barbershopId: string;
  specialization?: string;
}

export interface UpdateBarberRequest {
  specialization?: string;
  isActive?: boolean;
}

export interface BarberAvailabilityResponse {
  barberAvailabilityId: string;
  barberId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isAvailable: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface CreateBarberAvailabilityRequest {
  barberId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isAvailable: boolean;
}

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY'
}