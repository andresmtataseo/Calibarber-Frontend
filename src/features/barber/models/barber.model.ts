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
  startTime?: string; // HH:mm format - opcional para días no disponibles
  endTime?: string; // HH:mm format - opcional para días no disponibles
  isAvailable: boolean;
}

// Pagination interfaces
export interface PageableResponse {
  pageNumber: number;
  pageSize: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

export interface BarberPageResponse {
  content: BarberResponse[];
  pageable: PageableResponse;
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  numberOfElements: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  empty: boolean;
}