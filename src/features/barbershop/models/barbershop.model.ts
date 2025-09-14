import { BarbershopOperatingHours } from './operating-hours.model';

export interface BarbershopResponse {
  barbershopId: string;
  name: string;
  addressText: string;
  phoneNumber?: string;
  email?: string;
  operatingHours: BarbershopOperatingHours[];
  logoUrl?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface CreateBarbershopRequest {
  name: string;
  addressText: string;
  phoneNumber?: string;
  email?: string;
  logoUrl?: string;
}

export interface UpdateBarbershopRequest {
  name?: string;
  addressText?: string;
  phoneNumber?: string;
  email?: string;
  logoUrl?: string;
}
