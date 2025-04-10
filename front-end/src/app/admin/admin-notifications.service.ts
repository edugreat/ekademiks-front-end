import { HttpClient } from '@angular/common/http';
import { effect, Injectable, NgZone } from '@angular/core';
import { AuthService, User } from '../auth/auth.service';
import { BehaviorSubject } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class AdminNotificationsService {

  private connectionUrl = 'http://localhost:8080/admins/assessment/notify_me';

  // emits number of unread notifications to subscribers
  private unreadNotificationCounts = new BehaviorSubject<number>(0);  

  notificationCount$ = this.unreadNotificationCounts.asObservable();

  private assessmentNotifications:AssessmentResponseRecord[] = [];

  private unreadAssessmentResponseNotifications = new BehaviorSubject<AssessmentResponseRecord[]>(this.assessmentNotifications);

  private eventSource?:EventSource;

   // Timeout for reconnection to sse notification event 
   private reconnectionTimeout: any;

   // timer for retry connection
   private retryCount = 0;
 

  constructor(private http:HttpClient, 
    private authService:AuthService, private zone:NgZone) {


      const currentUser = toSignal(this.authService.loggedInUserObs$);

      effect(() => {

        const user = currentUser?.();

        if(user && this.isAdminUser(user)){

          this.connectToNotifications(user)
        } else {

          this.disconnectFromSSE();
        }
      })

     }

    //  disconnect from SSE notifications
  disconnectFromSSE() {
    
    if(this.eventSource){

      this.eventSource.close();

      clearTimeout(this.reconnectionTimeout)
    }
  }
  connectToNotifications(user: User) {
   
    // close previously opened connection
    if(this.eventSource) this.eventSource.close();
    this.eventSource = new EventSource(`${this.connectionUrl}?_xxid=${user.id}`);

    this.eventSource.addEventListener('processUpdate', (event) => { 

      this.zone.run(() => {

        if(event){

          console.log('connected to assessment notifications')
       
          const notification: AssessmentResponseRecord = JSON.parse(event.data);

          this.addToNotifications(notification);
       
       
        }
      })
    });

    // execute once there is error on connection
    this.eventSource.onerror = () => {

      console.log('reconnecting to notifications');

      const reconnectionTime = Math.min(1000 * Math.pow(2, this.retryCount), 30000);

      this.retryCount++;

      // closes and attempts reconnection after some time
      this.reconnectionTimeout = setTimeout(() => {
        
        this.connectToNotifications(user);
      }, reconnectionTime);
    };

    // resets connection time on successful connection
    this.eventSource.onopen = () => {

      this.retryCount = 0;
    }


  }
  addToNotifications(notification: AssessmentResponseRecord) {
    
    // pushes initial notification to the array of notification
    if(!this.assessmentNotifications.length){

      this.assessmentNotifications.push(notification);

      this.unreadAssessmentResponseNotifications.next(this.assessmentNotifications);

    }

  }

    //  returns if the currently logged in user is admin, false otherwise
  isAdminUser(user:User): boolean {
   
   return user.roles.some(role => role.toLocaleLowerCase() === 'admin' || role.toLowerCase() === 'superadmin')
  }
}

// encapsulate data of student's assessment response, used to notification assessment instructor about response to assessment
export interface AssessmentResponseRecord{
  topic:string,
  postedOn:Date,
  respondedOn:Date,
  studentId:number,
  instructorId:number


}