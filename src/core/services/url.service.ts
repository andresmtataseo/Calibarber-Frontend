import { Injectable } from '@angular/core';
import { API_URLS, EXTERNAL_URLS } from '../config/api-urls.config';

/**
 * Servicio para gestión centralizada de URLs
 * 
 * Proporciona métodos utilitarios para acceder a las URLs de la aplicación
 * de manera consistente y type-safe.
 * 
 * @example
 * ```typescript
 * constructor(private urlService: UrlService) {}
 * 
 * // Obtener URL de autenticación
 * const signInUrl = this.urlService.getAuthUrl('SIGN_IN');
 * 
 * // Obtener URL de barbería por ID
 * const barbershopUrl = this.urlService.getBarbershopUrl('BY_ID', '123');
 * 
 * // Generar avatar
 * const avatarUrl = this.urlService.generateAvatarUrl('Juan Pérez');
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class UrlService {

  /**
   * Obtiene una URL del módulo de autenticación
   */
  getAuthUrl(endpoint: keyof typeof API_URLS.AUTH): string {
    return API_URLS.AUTH[endpoint] as string;
  }

  /**
   * Obtiene una URL del módulo de usuarios
   */
  getUserUrl(endpoint: keyof typeof API_URLS.USER): string {
    return API_URLS.USER[endpoint] as string;
  }

  /**
   * Obtiene una URL del módulo de barberías
   * @param endpoint - El endpoint deseado
   * @param id - ID requerido para endpoints dinámicos
   */
  getBarbershopUrl(endpoint: keyof typeof API_URLS.BARBERSHOP, id?: string): string {
    const url = API_URLS.BARBERSHOP[endpoint];
    
    if (typeof url === 'function' && id) {
      return url(id);
    }
    
    return url as string;
  }

  /**
   * Obtiene una URL del módulo de barberos
   * @param endpoint - El endpoint deseado
   * @param id - ID requerido para endpoints dinámicos
   */
  getBarberUrl(endpoint: keyof typeof API_URLS.BARBER, id?: string): string {
    const url = API_URLS.BARBER[endpoint];
    
    if (typeof url === 'function' && id) {
      return url(id);
    }
    
    return url as string;
  }

  /**
   * Obtiene una URL del módulo de servicios
   * @param endpoint - El endpoint deseado
   * @param param - Parámetro requerido para endpoints dinámicos (id o category)
   */
  getServiceUrl(endpoint: keyof typeof API_URLS.SERVICE, param?: string): string {
    const url = API_URLS.SERVICE[endpoint];
    
    if (typeof url === 'function' && param) {
      return url(param);
    }
    
    return url as string;
  }

  /**
   * Obtiene una URL del módulo de citas
   * @param endpoint - El endpoint deseado
   * @param id - ID requerido para endpoints dinámicos
   */
  getAppointmentUrl(endpoint: keyof typeof API_URLS.APPOINTMENT, id?: string): string {
    const url = API_URLS.APPOINTMENT[endpoint];
    
    if (typeof url === 'function' && id) {
      return url(id);
    }
    
    return url as string;
  }

  /**
   * Obtiene una URL del módulo de pagos
   * @param endpoint - El endpoint deseado
   * @param id - ID requerido para endpoints dinámicos
   */
  getPaymentUrl(endpoint: keyof typeof API_URLS.PAYMENT, id?: string): string {
    const url = API_URLS.PAYMENT[endpoint];
    
    if (typeof url === 'function' && id) {
      return url(id);
    }
    
    return url as string;
  }

  /**
   * Genera una URL de avatar usando el servicio UI Avatars
   * @param name - Nombre para generar el avatar
   * @param background - Color de fondo (hex sin #)
   * @param color - Color del texto (hex sin #)
   * @param size - Tamaño del avatar en píxeles
   */
  generateAvatarUrl(
    name: string, 
    background: string = '570df8', 
    color: string = 'fff', 
    size: number = 40
  ): string {
    return EXTERNAL_URLS.UI_AVATARS.GENERATE(name, background, color, size);
  }

  /**
   * Obtiene URLs de redes sociales
   */
  getSocialMediaUrl(platform: keyof typeof EXTERNAL_URLS.SOCIAL_MEDIA): string {
    return EXTERNAL_URLS.SOCIAL_MEDIA[platform];
  }

  /**
   * Obtiene la URL base de la API
   */
  getApiBaseUrl(): string {
    return API_URLS.CONFIG.API_BASE;
  }

  /**
   * Obtiene URLs de desarrollo
   */
  getDevUrl(endpoint: keyof typeof API_URLS.DEV): string {
    return API_URLS.DEV[endpoint];
  }

  /**
   * Construye una URL completa con parámetros de consulta
   * @param baseUrl - URL base
   * @param params - Parámetros de consulta
   */
  buildUrlWithParams(baseUrl: string, params: Record<string, string | number | boolean>): string {
    const url = new URL(baseUrl);
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
    
    return url.toString();
  }

  /**
   * Valida si una URL es válida
   * @param url - URL a validar
   */
  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}