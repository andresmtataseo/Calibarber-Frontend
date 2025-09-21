/**
 * Configuración centralizada de URLs de la aplicación
 *
 * Este archivo contiene todas las URLs utilizadas en la aplicación,
 * organizadas por módulos para facilitar el mantenimiento y escalabilidad.
 *
 * @author CaliBarber Team
 * @version 1.0.0
 */

// Configuración base del API
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080',
  API_VERSION: 'v1',
  get API_BASE() {
    return `${this.BASE_URL}/api/${this.API_VERSION}`;
  }
} as const;

// URLs de autenticación
export const AUTH_URLS = {
  BASE: `${API_CONFIG.API_BASE}/auth`,
  SIGN_IN: `${API_CONFIG.API_BASE}/auth/sign-in`,
  SIGN_UP: `${API_CONFIG.API_BASE}/auth/sign-up`,
  CHECK_AUTH: `${API_CONFIG.API_BASE}/auth/check-auth`,
  CHECK_EMAIL: `${API_CONFIG.API_BASE}/auth/check-email`,
  FORGOT_PASSWORD: `${API_CONFIG.API_BASE}/auth/forgot-password`,
  RESET_PASSWORD: `${API_CONFIG.API_BASE}/auth/reset-password`,
  CHANGE_PASSWORD: `${API_CONFIG.API_BASE}/auth/change-password`,
  REFRESH_TOKEN: `${API_CONFIG.API_BASE}/auth/refresh-token`
} as const;

// URLs de usuarios
export const USER_URLS = {
  BASE: `${API_CONFIG.API_BASE}/users`,
  BY_ID: (id: string) => `${API_CONFIG.API_BASE}/users?id=${id}`,
  PROFILE: `${API_CONFIG.API_BASE}/users/profile`,
  UPDATE_PROFILE: `${API_CONFIG.API_BASE}/users/profile`,
  CHANGE_PASSWORD: `${API_CONFIG.API_BASE}/users/change-password`,
  UPLOAD_AVATAR: `${API_CONFIG.API_BASE}/users/avatar`,
  COUNT_ACTIVE: `${API_CONFIG.API_BASE}/users/count/active`
} as const;

// URLs de barberías
export const BARBERSHOP_URLS = {
  BASE: `${API_CONFIG.API_BASE}/barbershops`,
  SEARCH: `${API_CONFIG.API_BASE}/barbershops/search`,
  BY_ID: (id: string) => `${API_CONFIG.API_BASE}/barbershops/${id}`,
  SERVICES: (id: string) => `${API_CONFIG.API_BASE}/barbershops/${id}/services`,
  BARBERS: (id: string) => `${API_CONFIG.API_BASE}/barbershops/${id}/barbers`,
  REVIEWS: (id: string) => `${API_CONFIG.API_BASE}/barbershops/${id}/reviews`
} as const;

// URLs de barberos
export const BARBER_URLS = {
  BASE: `${API_CONFIG.API_BASE}/barbers`,
  BY_ID: (id: string) => `${API_CONFIG.API_BASE}/barbers/${id}`,
  AVAILABILITY: `${API_CONFIG.API_BASE}/barbers/availability`,
  SCHEDULE: (id: string) => `${API_CONFIG.API_BASE}/barbers/${id}/schedule`,
  AVAILABLE: `${API_CONFIG.API_BASE}/barbers/available`,
  COUNT_ACTIVE: `${API_CONFIG.API_BASE}/barbers/count/active`
} as const;

// URLs de servicios
export const SERVICE_URLS = {
  BASE: `${API_CONFIG.API_BASE}/services`,
  CREATE: `${API_CONFIG.API_BASE}/services`,
  BY_ID: `${API_CONFIG.API_BASE}/services/by-id`,
  ALL: `${API_CONFIG.API_BASE}/services/all`,
  BY_BARBERSHOP: `${API_CONFIG.API_BASE}/services/by-barbershop`,
  SEARCH_BY_NAME: `${API_CONFIG.API_BASE}/services/search/name`,
  SEARCH_BY_PRICE: `${API_CONFIG.API_BASE}/services/search/price`,
  SEARCH_BY_DURATION: `${API_CONFIG.API_BASE}/services/search/duration`,
  UPDATE: `${API_CONFIG.API_BASE}/services/update`,
  DELETE: `${API_CONFIG.API_BASE}/services/delete`,
  RESTORE: `${API_CONFIG.API_BASE}/services/restore`
} as const;

// URLs de citas
export const APPOINTMENT_URLS = {
  BASE: `${API_CONFIG.API_BASE}/appointments`,
  CREATE: `${API_CONFIG.API_BASE}/appointments`,
  BY_ID: `${API_CONFIG.API_BASE}/appointments/by-id`,
  ALL: `${API_CONFIG.API_BASE}/appointments/all`,
  UPDATE: `${API_CONFIG.API_BASE}/appointments/update`,
  DELETE: `${API_CONFIG.API_BASE}/appointments/delete`,
  BY_CLIENT: `${API_CONFIG.API_BASE}/appointments/by-client`,
  BY_BARBER: `${API_CONFIG.API_BASE}/appointments/by-barber`,
  BY_STATUS: `${API_CONFIG.API_BASE}/appointments/by-status`,
  UPCOMING_CLIENT: `${API_CONFIG.API_BASE}/appointments/upcoming/by-client`,
  UPCOMING_BARBER: `${API_CONFIG.API_BASE}/appointments/upcoming/by-barber`,
  CONFIRM: `${API_CONFIG.API_BASE}/appointments/confirm`,
  START: `${API_CONFIG.API_BASE}/appointments/start`,
  COMPLETE: `${API_CONFIG.API_BASE}/appointments/complete`,
  CANCEL: `${API_CONFIG.API_BASE}/appointments/cancel`,
  NO_SHOW: `${API_CONFIG.API_BASE}/appointments/no-show`,
  AVAILABLE_SLOTS: `${API_CONFIG.API_BASE}/appointments/available-slots`,
  CHECK_AVAILABILITY: `${API_CONFIG.API_BASE}/appointments/check-availability`,
  AVAILABILITY: `${API_CONFIG.API_BASE}/appointments/availability`,
  AVAILABILITY_DAY: `${API_CONFIG.API_BASE}/appointments/availability/day`,
  AVAILABILITY_BARBERS: `${API_CONFIG.API_BASE}/appointments/availability/barbers`,
  STATS: `${API_CONFIG.API_BASE}/appointments/stats`,
  COUNT_TODAY: `${API_CONFIG.API_BASE}/appointments/count/today`
} as const;

// URLs de pagos
export const PAYMENT_URLS = {
  BASE: `${API_CONFIG.API_BASE}/payments`,
  PROCESS: `${API_CONFIG.API_BASE}/payments/process`,
  HISTORY: `${API_CONFIG.API_BASE}/payments/history`,
  BY_ID: (id: string) => `${API_CONFIG.API_BASE}/payments/${id}`,
  REFUND: (id: string) => `${API_CONFIG.API_BASE}/payments/${id}/refund`
} as const;

// URLs externas
export const EXTERNAL_URLS = {
  // Servicio de avatares
  UI_AVATARS: {
    BASE: 'https://ui-avatars.com/api/',
    GENERATE: (name: string, background = '570df8', color = 'fff', size = 40) =>
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${background}&color=${color}&size=${size}`
  },

  // Redes sociales
  SOCIAL_MEDIA: {
    INSTAGRAM: 'https://instagram.com/calibarber',
    FACEBOOK: 'https://facebook.com/calibarber',
    TWITTER: 'https://twitter.com/calibarber'
  }
} as const;

// URLs de desarrollo y testing
export const DEV_URLS = {
  MOCK_API: 'http://localhost:3000/api',
  SWAGGER_DOCS: `${API_CONFIG.BASE_URL}/swagger-ui`,
  API_DOCS: `${API_CONFIG.BASE_URL}/api-docs`
} as const;

// Exportación consolidada de todas las URLs
export const API_URLS = {
  CONFIG: API_CONFIG,
  AUTH: AUTH_URLS,
  USER: USER_URLS,
  BARBERSHOP: BARBERSHOP_URLS,
  BARBER: BARBER_URLS,
  SERVICE: SERVICE_URLS,
  APPOINTMENT: APPOINTMENT_URLS,
  PAYMENT: PAYMENT_URLS,
  EXTERNAL: EXTERNAL_URLS,
  DEV: DEV_URLS
} as const;

// Tipo para autocompletado y type safety
export type ApiUrls = typeof API_URLS;
