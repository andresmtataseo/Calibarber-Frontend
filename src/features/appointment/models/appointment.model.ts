export interface AppointmentResponse {
  appointmentId: string;
  clientId: string;
  barberId: string;
  serviceId: string;
  appointmentDate: string; // ISO date string
  appointmentTime: string; // HH:mm format
  status: AppointmentStatus;
  notes?: string;
  totalAmount: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  client: ClientInfo;
  barber: BarberInfo;
  service: ServiceInfo;
  payment?: PaymentInfo;
}

export interface CreateAppointmentRequest {
  clientId: string;
  barberId: string;
  serviceId: string;
  appointmentDate: string; // yyyy-MM-dd format
  appointmentTime: string; // HH:mm format
  notes?: string;
}

export interface UpdateAppointmentRequest {
  appointmentDate?: string; // yyyy-MM-dd format
  appointmentTime?: string; // HH:mm format
  status?: AppointmentStatus;
  notes?: string;
}

export interface RescheduleAppointmentRequest {
  appointmentDate: string; // yyyy-MM-dd format
  appointmentTime: string; // HH:mm format
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

export interface ClientInfo {
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

export interface PaymentInfo {
  paymentId: string;
  amount: number;
  paymentMethod: string;
  status: string;
  transactionReference?: string;
}