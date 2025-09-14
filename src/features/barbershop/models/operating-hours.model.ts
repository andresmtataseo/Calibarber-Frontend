export interface BarbershopOperatingHours {
  operatingHoursId: string;
  dayOfWeek: DayOfWeek; // Enum DayOfWeek del backend
  dayName: string;
  openingTime?: string; // HH:mm format (LocalTime serializado)
  closingTime?: string; // HH:mm format (LocalTime serializado)
  isClosed: boolean;
  notes?: string;
  formattedHours: string;
  isOpen?: boolean; // Campo calculado opcional
}

/**
 * DTO para request de creación y actualización de horarios de operación de barbería.
 * Coincide exactamente con BarbershopOperatingHoursRequestDto del backend.
 */
export interface BarbershopOperatingHoursRequest {
  barbershopId: string;
  dayOfWeek: DayOfWeek;
  openingTime?: string; // HH:mm format
  closingTime?: string; // HH:mm format
  isClosed?: boolean;
  notes?: string;
}

/**
 * Clase para manejar requests de horarios con validaciones.
 * Implementa la misma lógica de validación que el backend.
 */
export class BarbershopOperatingHoursRequestDto implements BarbershopOperatingHoursRequest {
  barbershopId: string;
  dayOfWeek: DayOfWeek;
  openingTime?: string;
  closingTime?: string;
  isClosed?: boolean;
  notes?: string;

  constructor(data: BarbershopOperatingHoursRequest) {
    this.barbershopId = data.barbershopId;
    this.dayOfWeek = data.dayOfWeek;
    this.openingTime = data.openingTime;
    this.closingTime = data.closingTime;
    this.isClosed = data.isClosed ?? false;
    this.notes = data.notes;
  }

  /**
   * Valida que los datos del horario sean consistentes.
   * Si no está cerrado, debe tener horarios de apertura y cierre.
   * La hora de cierre debe ser posterior a la de apertura.
   */
  isValidSchedule(): boolean {
    // Si está cerrado, no necesita validar horarios
    if (this.isClosed === true) {
      return true;
    }
    
    // Si no está cerrado, debe tener horarios
    if (!this.openingTime || !this.closingTime) {
      return false;
    }
    
    // La hora de cierre debe ser posterior a la de apertura
    return this.closingTime > this.openingTime;
  }

  /**
   * Obtiene un mensaje de error específico si la validación falla.
   */
  getValidationErrorMessage(): string | null {
    if (this.isClosed === true) {
      return null; // No hay error si está cerrado
    }
    
    if (!this.openingTime) {
      return 'La hora de apertura es obligatoria cuando la barbería no está cerrada';
    }
    
    if (!this.closingTime) {
      return 'La hora de cierre es obligatoria cuando la barbería no está cerrada';
    }
    
    if (this.closingTime <= this.openingTime) {
      return 'La hora de cierre debe ser posterior a la hora de apertura';
    }
    
    return null;
  }
}

/**
 * @deprecated Use BarbershopOperatingHoursRequest instead
 */
export interface BarbershopOperatingHoursCreate {
  dayOfWeek: DayOfWeek; // Enum DayOfWeek del backend
  openingTime?: string; // HH:mm format (LocalTime)
  closingTime?: string; // HH:mm format (LocalTime)
  isClosed: boolean;
  notes?: string;
}

// Enum para los días de la semana (compatible con Java DayOfWeek)
export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY'
}

// Mapeo de números a días de la semana
export const DAY_OF_WEEK_MAP: Record<number, DayOfWeek> = {
  1: DayOfWeek.MONDAY,
  2: DayOfWeek.TUESDAY,
  3: DayOfWeek.WEDNESDAY,
  4: DayOfWeek.THURSDAY,
  5: DayOfWeek.FRIDAY,
  6: DayOfWeek.SATURDAY,
  7: DayOfWeek.SUNDAY
};

// Mapeo de días de la semana a números
export const DAY_OF_WEEK_NUMBER_MAP: Record<DayOfWeek, number> = {
  [DayOfWeek.MONDAY]: 1,
  [DayOfWeek.TUESDAY]: 2,
  [DayOfWeek.WEDNESDAY]: 3,
  [DayOfWeek.THURSDAY]: 4,
  [DayOfWeek.FRIDAY]: 5,
  [DayOfWeek.SATURDAY]: 6,
  [DayOfWeek.SUNDAY]: 7
};