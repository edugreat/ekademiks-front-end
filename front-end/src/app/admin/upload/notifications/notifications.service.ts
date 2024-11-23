import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AuthService } from '../../../auth/auth.service';
import { HttpBackend, HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  // Delivers the notifications counts to subscribes
  // This is used to update the number of unread notifications at the app-component
  private unreaNotificationsCount = new BehaviorSubject<number>(0);

  notificationCount$ = this.unreaNotificationsCount.asObservable();

  // emits all received notifications to subscriber. This is initialized to all notifications received upon login
  private unreadNotifications = new BehaviorSubject<_Notification[]>(this.notifications)

  unreadNotifications$ = this.unreadNotifications.asObservable();


  private eventSource?: EventSource

  // server notification url
  private notificationUrl = 'http://localhost:8080/notice/notify_me';

  // An array that stores all received notifications
  private _notifications: _Notification[] = [];





  // Timeout for reconnection to sse notification event 
  private reconnectionTiming: any;


  constructor(private zone: NgZone, private authService: AuthService, private http:HttpClient) {

    // subscribe to get notified on student's log in . If a student has logged in, connect to server's notification
    authService.studentLoginObs$.subscribe(isLoggedIn => {

      if (isLoggedIn) {

        this.connectToNotifications();
      } else {

        // disconnect from receiving notification if a student has logged out
        this.disconnectFromNotifications();
      }

    })
  }


  // return all unread notifications
  public get notifications(): _Notification[] {
    return this._notifications;
  }



  // Updates the count of unread notifications
  updateNotificationsCounts(unread: number) {

    this.unreaNotificationsCount.next(unread);
  }



  private connectToNotifications() {

    // Close previous event source before connecting to avoid cyclic issues
    if (this.eventSource) this.eventSource.close();

    // create a new event source passing the sse notification api
    this.eventSource = new EventSource(`${this.notificationUrl}?studentId=${this.authService.studentId}`);

    this.eventSource.addEventListener('notifications', (event: MessageEvent<any>) => {

      this.zone.run(() => {

        // checks if there is notification
        if (event) {


          // Parses the received object to its correct json object
          const notification: _Notification = JSON.parse(event.data);


          this.addToNotifications(notification);
        }
      })
    });

    // executes once there is error suc as timeout of the server connection etc
    this.eventSource.onerror = () => {

      // close the event source for error, then reconnect after some timing
      this.reconnectionTiming = setTimeout(() => {

        // connect back to notification
        this.connectToNotifications();
      }, 5000);

    }


  }



  // Disconnects  from the notification
  private disconnectFromNotifications() {
    // check if connection had been made before
    if (this.eventSource) {

      this.eventSource.close();
      clearTimeout(this.reconnectionTiming)
    }



  }
  // Add the just arriving notification if has not been received till not
  private addToNotifications(newNotification: _Notification) {



    // pushes the first notification to the notifications array
    if (this.notifications.length === 0) {

      this._notifications.push(newNotification);
      this.unreadNotifications.next(this.notifications);

      // emits the size of unread notifications so that subscriber can update notifications counts
      this.unreaNotificationsCount.next(this.notifications.length)


    } else {

      // check if the notification is already pushed
      const index = this._notifications.findIndex(x => x.id === newNotification.id);

      if (index < 0) {
        this._notifications.push(newNotification);

        this.unreadNotifications.next(this.notifications)

        // emits the size of unread notifications so that subscriber can update notifications counts
        this.unreaNotificationsCount.next(this.notifications.length)
       


      }

    }


  }

  // communicates to the server to delete this notifcation for the particular student id = "studentId".
  // This is to avoid serving stale notification after they have alerad read the notification
  notificationIsRead(notificationId:number, studentId:number):Observable<void>{

    return this.http.patch<void>(`http://localhost:8080/notice/read?studentId=${studentId}`, notificationId);

  }
}




// An object representing the notifications logged in user receive.
// Notification can be for new assessment upload, resut release etc
export type _Notification = {
  id: number,
  type: string,
  metadata: number,
  message: string,
  createdAt: string,
  //in the case of notification for request to join new group chat, 'notifier' is the name of the user who wants to join the group chat.
  notifier?:string 
 


}

