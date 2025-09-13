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

export interface BarbershopOperatingHours {
  operatingHoursId: string;
  dayOfWeek: number; // 1-7 (Monday-Sunday)
  dayName: string;
  openingTime?: string; // HH:mm format
  closingTime?: string; // HH:mm format
  isClosed: boolean;
  notes?: string;
  formattedHours: string;
  isOpen: boolean;
}

export interface BarbershopOperatingHoursCreate {
  dayOfWeek: number; // 1-7 (Monday-Sunday)
  openingTime?: string; // HH:mm format
  closingTime?: string; // HH:mm format
  isClosed: boolean;
  notes?: string;
}

export interface CreateBarbershopRequest {
  name: string;
  addressText: string;
  phoneNumber?: string;
  email?: string;
  operatingHours: BarbershopOperatingHoursCreate[];
  logoUrl?: string;
}

export interface UpdateBarbershopRequest {
  name?: string;
  addressText?: string;
  phoneNumber?: string;
  email?: string;
  operatingHours?: BarbershopOperatingHoursCreate[];
  logoUrl?: string;
}

export interface BarbershopCreate {
  name: string;
  addressText: string;
  phoneNumber?: string;
  email?: string;
  logoUrl?: string;
}

export interface BarbershopUpdate {
  name?: string;
  addressText?: string;
  phoneNumber?: string;
  email?: string;
  logoUrl?: string;
}