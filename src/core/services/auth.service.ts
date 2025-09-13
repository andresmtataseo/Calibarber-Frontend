import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import {
  SignInRequestDto,
  SignUpRequestDto,
  AuthResponseDto,
  ApiResponseDto,
  AuthState,
  UserDto,
  CheckAuthResponseDto
} from '../../shared/models/auth.models';
import { UrlService } from './url.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly urlService = inject(UrlService);
  private readonly TOKEN_KEY = 'calibarber_token';
  private readonly USER_KEY = 'calibarber_user';

  // Estado de autenticación reactivo
  private authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null
  });

  public authState$ = this.authStateSubject.asObservable();

  constructor() {
    this.initializeAuthState();
  }

  /**
   * Inicializa el estado de autenticación desde localStorage
   */
  private initializeAuthState(): void {
    try {
      const token = this.getStoredToken();
      const user = this.getStoredUser();

      if (token && user) {
        // Validar que el token no esté vacío o sea inválido
        if (token.trim() && token !== 'null' && token !== 'undefined') {
          console.log('Restaurando sesión desde localStorage');
          this.updateAuthState({
            isAuthenticated: true,
            user,
            token
          });
        } else {
          console.warn('Token inválido encontrado en localStorage, limpiando...');
          this.clearStoredAuth();
        }
      } else {
        console.log('No se encontró sesión válida en localStorage');
      }
    } catch (error) {
      console.error('Error al inicializar estado de autenticación:', error);
      this.clearStoredAuth();
    }
  }

  /**
   * Realiza el login del usuario
   */
  signIn(credentials: SignInRequestDto): Observable<AuthResponseDto> {
    return this.http.post<ApiResponseDto<AuthResponseDto>>(
      this.urlService.getAuthUrl('SIGN_IN'),
      credentials
    ).pipe(
      map(response => {
        if (response.data) {
          this.handleSuccessfulAuth(response.data);
          return response.data;
        }
        throw new Error('No se recibieron datos de autenticación');
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Registra un nuevo usuario
   */
  signUp(userData: SignUpRequestDto): Observable<AuthResponseDto> {
    return this.http.post<ApiResponseDto<AuthResponseDto>>(
      this.urlService.getAuthUrl('SIGN_UP'),
      userData
    ).pipe(
      map(response => {
        if (response.data) {
          this.handleSuccessfulAuth(response.data);
          return response.data;
        }
        throw new Error('No se recibieron datos de autenticación');
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Verifica el estado de autenticación con el backend
   */
  checkAuth(): Observable<CheckAuthResponseDto> {
    return this.http.get<ApiResponseDto<CheckAuthResponseDto>>(
      this.urlService.getAuthUrl('CHECK_AUTH')
    ).pipe(
      map(response => {
        if (response.data) {
          // Verificar si el token es válido y el usuario está activo
          if (response.data.isTokenValid && response.data.isActive) {
            // Crear UserDto a partir de la respuesta
            const user: UserDto = {
              id: response.data.userId,
              email: response.data.email,
              fullName: response.data.fullName,
              role: response.data.role
            };

            // Actualizar el estado con los datos del usuario del backend
            this.updateAuthState({
              isAuthenticated: true,
              user: user,
              token: this.getToken()
            });
            this.storeUser(user);
          } else {
            // Token inválido o usuario inactivo, limpiar sesión
            console.warn('Token inválido o usuario inactivo');
            this.signOut();
          }
          return response.data;
        }
        throw new Error('No se pudo verificar la autenticación');
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Verifica si un email está disponible para registro
   */
  checkEmailAvailability(email: string): Observable<{ message: string; available: boolean }> {
    const normalizedEmail = email.toLowerCase().trim();
    return this.http.get<ApiResponseDto<string>>(
      `${this.urlService.getAuthUrl('CHECK_EMAIL')}?email=${encodeURIComponent(normalizedEmail)}`
    ).pipe(
      map(response => {
        const available = response.message === 'El email está disponible';
        return {
          message: response.message,
          available
        };
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Envía una solicitud de recuperación de contraseña
   * @param email Email del usuario
   * @returns Observable con la respuesta del servidor
   */
  forgotPassword(email: string): Observable<{ status: number; message: string }> {
    const normalizedEmail = email.toLowerCase().trim();
    
    return this.http.post<{ status: number; message: string; timestamp: string; path: string }>(
      this.urlService.getAuthUrl('FORGOT_PASSWORD'),
      { email: normalizedEmail }
    ).pipe(
      map(response => ({
        status: response.status,
        message: response.message
      })),
      catchError((error: HttpErrorResponse) => {
        // Manejar respuestas de error del servidor (404, etc.)
        if (error.error && error.error.status && error.error.message) {
          return throwError(() => ({
            status: error.error.status,
            message: error.error.message
          }));
        }
        return this.handleError(error);
      })
    );
  }

  /**
   * Restablece la contraseña usando el token de recuperación
   * @param token Token de restablecimiento
   * @param newPassword Nueva contraseña
   * @param confirmNewPassword Confirmación de la nueva contraseña
   * @returns Observable con la respuesta del servidor
   */
  resetPassword(token: string, newPassword: string, confirmNewPassword: string): Observable<{ status: number; message: string }> {
    return this.http.post<{ status: number; message: string; timestamp: string; path: string }>(
      this.urlService.getAuthUrl('RESET_PASSWORD'),
      { 
        token: token.trim(),
        newPassword,
        confirmNewPassword
      }
    ).pipe(
      map(response => ({
        status: response.status,
        message: response.message
      })),
      catchError((error: HttpErrorResponse) => {
        // Manejar respuestas de error del servidor (400, etc.)
        if (error.error && error.error.status && error.error.message) {
          return throwError(() => ({
            status: error.error.status,
            message: error.error.message
          }));
        }
        return this.handleError(error);
      })
    );
  }

  /**
   * Cierra la sesión del usuario
   */
  signOut(): void {
    this.clearStoredAuth();
    this.updateAuthState({
      isAuthenticated: false,
      user: null,
      token: null
    });
  }

  /**
   * Obtiene el token actual
   */
  getToken(): string | null {
    return this.authStateSubject.value.token || this.getStoredToken();
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated && !!this.getToken();
  }

  /**
   * Obtiene el usuario actual
   */
  getCurrentUser(): UserDto | null {
    return this.authStateSubject.value.user || this.getStoredUser();
  }

  /**
   * Maneja una autenticación exitosa
   */
  private handleSuccessfulAuth(authResponse: AuthResponseDto): void {
    // Crear UserDto a partir de la respuesta de autenticación
    const user: UserDto = {
      id: authResponse.userId,
      email: authResponse.email,
      fullName: authResponse.fullName,
      role: authResponse.role
    };

    this.storeToken(authResponse.token);
    this.storeUser(user);
    this.updateAuthState({
      isAuthenticated: true,
      user: user,
      token: authResponse.token
    });
  }

  /**
   * Actualiza el estado de autenticación
   */
  private updateAuthState(newState: AuthState): void {
    this.authStateSubject.next(newState);
  }

  /**
   * Almacena el token en localStorage
   */
  private storeToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Almacena el usuario en localStorage
   */
  private storeUser(user: UserDto): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Obtiene el token almacenado
   */
  private getStoredToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Obtiene el usuario almacenado
   */
  private getStoredUser(): UserDto | null {
    try {
      const userJson = localStorage.getItem(this.USER_KEY);
      if (!userJson || userJson === 'undefined' || userJson === 'null') {
        return null;
      }
      return JSON.parse(userJson);
    } catch (error) {
      console.warn('Error parsing stored user data:', error);
      // Limpiar datos corruptos
      localStorage.removeItem(this.USER_KEY);
      return null;
    }
  }

  /**
   * Limpia la autenticación almacenada
   */
  private clearStoredAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Maneja errores de HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error inesperado';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      if (error.status === 401) {
        errorMessage = 'Credenciales inválidas';
        this.signOut(); // Limpiar sesión si el token es inválido
      } else if (error.status === 403) {
        errorMessage = 'No tienes permisos para realizar esta acción';
      } else if (error.status === 0) {
        errorMessage = 'No se pudo conectar con el servidor';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }

    console.error('Auth Service Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
