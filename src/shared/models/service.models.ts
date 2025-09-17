// Interfaces para las DTOs de servicios de barbería

import { ApiResponseDto } from './auth.models';

// Request DTOs
export interface CreateServiceRequestDto {
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  barbershopId: string;
}

export interface UpdateServiceRequestDto {
  name?: string;
  description?: string;
  price?: number;
  durationMinutes?: number;
}

// Response DTOs
export interface ServiceResponseDto {
  id?: string;
  serviceId?: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  barbershopId: string;
  barbershopName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Parámetros de búsqueda y paginación
export interface ServiceSearchParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface ServicesByBarbershopParams extends ServiceSearchParams {
  barbershopId: string;
}

export interface ServicesByNameParams extends ServiceSearchParams {
  name: string;
}

export interface ServicesByPriceRangeParams extends ServiceSearchParams {
  minPrice: number;
  maxPrice: number;
}

export interface ServicesByDurationRangeParams extends ServiceSearchParams {
  minDuration: number;
  maxDuration: number;
}

// Interfaces para respuestas paginadas
export interface PageableResponse<T> {
  content: T[];
  pageable: {
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    pageSize: number;
    pageNumber: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

// Tipos de respuesta específicos para servicios
export type ServiceApiResponse = ApiResponseDto<ServiceResponseDto>;
export type ServicesPageApiResponse = ApiResponseDto<PageableResponse<ServiceResponseDto>>;
export type DeleteServiceApiResponse = ApiResponseDto<void>;