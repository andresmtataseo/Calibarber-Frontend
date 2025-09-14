import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationItem } from './notification.service';
import { NotificationType } from './notification.component';

@Component({
  selector: 'app-notification-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-item transition-all duration-300 ease-in-out" 
         [class.opacity-0]="!isVisible" 
         [class.opacity-100]="isVisible"
         [class.translate-x-full]="!isVisible"
         [class.translate-x-0]="isVisible">
      <div [ngClass]="getAlertClass()" 
           class="shadow-lg min-w-80 max-w-96 sm:min-w-72 sm:max-w-80 transform transition-all duration-300 ease-out backdrop-blur-sm hover:scale-105 hover:shadow-xl">
        <div class="flex items-center gap-3">
          <span class="text-lg" [innerHTML]="getIcon()"></span>
          <span class="flex-1 text-sm font-medium">{{ notification.message }}</span>
          <button 
            *ngIf="!notification.autoClose" 
            class="btn btn-ghost btn-xs btn-circle hover:bg-opacity-20 transition-colors duration-200" 
            (click)="onClose()"
            aria-label="Cerrar notificación">
            ✕
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .toast-item {
      margin-bottom: 0.5rem;
    }
  `]
})
export class NotificationItemComponent implements OnInit, OnDestroy {
  @Input() notification!: NotificationItem;
  @Output() close = new EventEmitter<string>();

  isVisible: boolean = false;
  private timeoutId?: number;

  ngOnInit(): void {
    // Mostrar la notificación con una pequeña demora para la animación
    setTimeout(() => {
      this.isVisible = true;
    }, 100);

    // Configurar cierre automático si está habilitado
    if (this.notification.autoClose && this.notification.duration && this.notification.duration > 0) {
      this.timeoutId = window.setTimeout(() => {
        this.onClose();
      }, this.notification.duration);
    }
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  onClose(): void {
    this.isVisible = false;
    // Esperar a que termine la animación antes de emitir el evento de cierre
    setTimeout(() => {
      this.close.emit(this.notification.id);
    }, 300);
  }

  getAlertClass(): string {
    const baseClass = 'alert';
    switch (this.notification.type) {
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
    switch (this.notification.type) {
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