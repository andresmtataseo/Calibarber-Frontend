import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
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

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly API_BASE_URL = 'http://localhost:8080/api/v1/auth';
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
    const token = this.getStoredToken();
    const user = this.getStoredUser();

    if (token && user) {
      this.updateAuthState({
        isAuthenticated: true,
        user,
        token
      });
    }
  }

  /**
   * Realiza el login del usuario
   */
  signIn(credentials: SignInRequestDto): Observable<AuthResponseDto> {
    return this.http.post<ApiResponseDto<AuthResponseDto>>(
      `${this.API_BASE_URL}/sign-in`,
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
      `${this.API_BASE_URL}/sign-up`,
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
      `${this.API_BASE_URL}/check-auth`
    ).pipe(
      map(response => {
        if (response.data) {
          return response.data;
        }
        throw new Error('No se pudo verificar la autenticación');
      }),
      catchError(this.handleError.bind(this))
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
    this.storeToken(authResponse.token);
    this.storeUser(authResponse.user);

    this.updateAuthState({
      isAuthenticated: true,
      user: authResponse.user,
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
    const userJson = localStorage.getItem(this.USER_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        this.clearStoredAuth();
      }
    }
    return null;
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
