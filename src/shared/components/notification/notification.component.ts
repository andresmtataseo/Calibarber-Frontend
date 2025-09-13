import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface NotificationData {
  type: NotificationType;
  message: string;
  duration?: number;
}

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit, OnDestroy {
  @Input() type: NotificationType = 'info';
  @Input() message: string = '';
  @Input() duration: number = 5000; // 5 segundos por defecto
  @Input() autoClose: boolean = true;

  isVisible: boolean = false;
  private timeoutId?: number;

  ngOnInit(): void {
    // Mostrar la notificación con una pequeña demora para la animación
    setTimeout(() => {
      this.isVisible = true;
    }, 100);

    // Configurar cierre automático si está habilitado
    if (this.autoClose && this.duration > 0) {
      this.timeoutId = window.setTimeout(() => {
        this.close();
      }, this.duration);
    }
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  close(): void {
    this.isVisible = false;
    // Esperar a que termine la animación antes de destruir el componente
    setTimeout(() => {
      // Aquí se podría emitir un evento para notificar al padre que se cerró
    }, 300);
  }

  getAlertClass(): string {
    const baseClass = 'alert';
    switch (this.type) {
      case 'info':
        return `${baseClass} alert-info`;
      case 'success':
        return `${baseClass} alert-success`;
      case 'warning':
        return `${baseClass} alert-warning`;
      case 'error':
        return `${baseClass} alert-error`;
      default:
        return `${baseClass} alert-info`;
    }
  }

  getIcon(): string {
    switch (this.type) {
      case 'info':
        return '🛈';
      case 'success':
        return '✓';
      case 'warning':
        return '⚠';
      case 'error':
        return '✕';
      default:
        return '🛈';
    }
  }
}