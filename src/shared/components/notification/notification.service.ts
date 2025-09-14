import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface NotificationItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  autoClose?: boolean;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications$ = new BehaviorSubject<NotificationItem[]>([]);
  private notificationCounter = 0;
  private readonly MAX_NOTIFICATIONS = 5;

  /**
   * Muestra una notificación
   */
  show(type: NotificationItem['type'], message: string, duration: number = 5000, autoClose: boolean = true): string {
    const notification: NotificationItem = {
      id: this.generateId(),
      type,
      message,
      duration,
      autoClose,
      timestamp: new Date()
    };

    const currentNotifications = this.notifications$.value;
    
    // Limitar el número de notificaciones simultáneas
    let updatedNotifications = [...currentNotifications, notification];
    if (updatedNotifications.length > this.MAX_NOTIFICATIONS) {
      updatedNotifications = updatedNotifications.slice(-this.MAX_NOTIFICATIONS);
    }
    
    this.notifications$.next(updatedNotifications);

    // Auto-remover si está configurado
    if (autoClose && duration > 0) {
      setTimeout(() => {
        this.remove(notification.id);
      }, duration);
    }

    return notification.id;
  }

  success(message: string, duration?: number, autoClose?: boolean): string {
    return this.show('success', message, duration, autoClose);
  }

  error(message: string, duration?: number, autoClose?: boolean): string {
    return this.show('error', message, duration, autoClose);
  }

  warning(message: string, duration?: number, autoClose?: boolean): string {
    return this.show('warning', message, duration, autoClose);
  }

  info(message: string, duration?: number, autoClose?: boolean): string {
    return this.show('info', message, duration, autoClose);
  }

  remove(id: string): void {
    const currentNotifications = this.notifications$.value;
    this.notifications$.next(currentNotifications.filter(n => n.id !== id));
  }

  clear(): void {
    this.notifications$.next([]);
  }

  get notifications(): Observable<NotificationItem[]> {
    return this.notifications$.asObservable();
  }

  /**
   * Genera un ID único para la notificación
   */
  private generateId(): string {
    return `notification-${++this.notificationCounter}-${Date.now()}`;
  }
}