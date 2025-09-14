import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { NotificationService, NotificationItem } from './notification.service';
import { NotificationItemComponent } from './notification-item.component';

@Component({
  selector: 'app-notification-container',
  standalone: true,
  imports: [CommonModule, NotificationItemComponent],
  template: `
    <div class="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none">
      <div 
        *ngFor="let notification of notifications; trackBy: trackByNotificationId"
        class="pointer-events-auto transform transition-all duration-300 ease-in-out"
        [class.animate-slide-in-right]="true">
        <app-notification-item
          [notification]="notification"
          (close)="onNotificationClose($event)">
        </app-notification-item>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slide-in-right {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    .animate-slide-in-right {
      animation: slide-in-right 0.3s ease-out;
    }
  `]
})
export class NotificationContainerComponent implements OnInit, OnDestroy {
  notifications: NotificationItem[] = [];
  private subscription?: Subscription;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.subscription = this.notificationService.notifications.subscribe(
      notifications => {
        this.notifications = notifications;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onNotificationClose(notificationId: string): void {
    this.notificationService.remove(notificationId);
  }

  trackByNotificationId(index: number, notification: NotificationItem): string {
    return notification.id;
  }
}