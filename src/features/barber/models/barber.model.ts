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

import { DayOfWeek } from '../../barbershop/models/operating-hours.model';

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