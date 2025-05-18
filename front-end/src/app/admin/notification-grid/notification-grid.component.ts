import { Component, effect, inject, signal } from '@angular/core';
import { AdminNotificationsService, AssessmentResponseRecord } from '../admin-notifications.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointService } from '../../breakpoint.service';
import { CssLoaderService } from '../../css-loader.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-notification-grid',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './notification-grid.component.html'
})

// displays unread notifications in a grid format
export class NotificationGridComponent {

  private adminNotificationsService = inject(AdminNotificationsService);

    breaks:'xs'|'sm'|'md'|'lg'|'xl' = 'lg';

  private breakpointService = inject(BreakpointService);

  // get the current user
  private userScreenSize = toSignal(this.breakpointService.breakpoint$);

  // dynamic css loading service
  private cssLoadingService = inject(CssLoaderService);

  // subscribe to be notified of unread notification (especially students attempts to assessments)
  protected unreadNotifications = this.adminNotificationsService.notifications();

  submissionNotifications = signal(this.adminNotificationsService.notifications())

  notifiction?:AssessmentResponseRecord;


  constructor(){

    effect(() => {
     
      const screenSize = this.userScreenSize()!;

     


      console.log(`screen size: ${screenSize}`);

      this.cssLoadingService.createCSSLink(screenSize);

      if (['xs', 'sm', 'md', 'lg', 'xl'].includes(screenSize)) {
        this.breaks = screenSize as 'xs' | 'sm' | 'md' | 'lg' | 'xl';
      }
    });
  }

}

