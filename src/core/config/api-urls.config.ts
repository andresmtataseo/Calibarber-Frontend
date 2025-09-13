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
  UPLOAD_AVATAR: `${API_CONFIG.API_BASE}/users/avatar`
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
  AVAILABILITY: (id: string) => `${API_CONFIG.API_BASE}/barbers/${id}/availability`,
  SCHEDULE: (id: string) => `${API_CONFIG.API_BASE}/barbers/${id}/schedule`
} as const;

// URLs de servicios
export const SERVICE_URLS = {
  BASE: `${API_CONFIG.API_BASE}/services`,
  BY_ID: (id: string) => `${API_CONFIG.API_BASE}/services/${id}`,
  BY_CATEGORY: (category: string) => `${API_CONFIG.API_BASE}/services/category/${category}`,
  POPULAR: `${API_CONFIG.API_BASE}/services/popular`
} as const;

// URLs de citas
export const APPOINTMENT_URLS = {
  BASE: `${API_CONFIG.API_BASE}/appointments`,
  BY_ID: (id: string) => `${API_CONFIG.API_BASE}/appointments/${id}`,
  USER_APPOINTMENTS: `${API_CONFIG.API_BASE}/appointments/user`,
  BARBER_APPOINTMENTS: `${API_CONFIG.API_BASE}/appointments/barber`,
  CREATE: `${API_CONFIG.API_BASE}/appointments`,
  UPDATE: (id: string) => `${API_CONFIG.API_BASE}/appointments/${id}`,
  CANCEL: (id: string) => `${API_CONFIG.API_BASE}/appointments/${id}/cancel`,
  CONFIRM: (id: string) => `${API_CONFIG.API_BASE}/appointments/${id}/confirm`
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