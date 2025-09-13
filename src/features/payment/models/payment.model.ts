export interface PaymentResponse {
  paymentId: string;
  appointmentId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionReference?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  appointment: AppointmentInfo;
}

export interface CreatePaymentRequest {
  appointmentId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionReference?: string;
}

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  TRANSFER = 'TRANSFER',
  DIGITAL_WALLET = 'DIGITAL_WALLET'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export interface AppointmentInfo {
  appointmentId: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  totalAmount: number;
}