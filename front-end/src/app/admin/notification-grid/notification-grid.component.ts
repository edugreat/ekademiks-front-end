import { Component, inject } from '@angular/core';
import { AdminNotificationsService } from '../admin-notifications.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-notification-grid',
  standalone: true,
  imports: [],
  templateUrl: './notification-grid.component.html',
  styleUrl: './notification-grid.component.css'
})

// displays unread notifications in a grid format
export class NotificationGridComponent {

  private adminNotificationsService = inject(AdminNotificationsService);

  // subscribe to be notified of unread notification (especially students attempts to assessments)
  protected unreadNotifications = this.adminNotificationsService.notifications();

}
