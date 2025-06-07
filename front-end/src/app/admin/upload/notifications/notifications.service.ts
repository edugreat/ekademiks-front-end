import { computed, effect, inject, Injectable, NgZone, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService, User } from '../../../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { EventSourceMessage, fetchEventSource } from '@microsoft/fetch-event-source';
import { LogoutDetectorService } from '../../../logout-detector.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  // initialize unread notification with 0 count, then recalculate once there are changes.
  notificationCount = computed(() => {
    return this.unreadNotifications().length;
  })

  unreadNotifications = signal<_Notification[]>([]);

  private abortController:AbortController | null = null;
  // server notification url
  private notificationUrl = 'http://localhost:8080/notice/notify_me';

  

  // timer for connection retry
  private retryCount = 0;

  // maximum times to retry
  private maxRetries = 50;

  private baseDelay = 1000;

  private zone = inject(NgZone);
  private  authService = inject(AuthService);
  private http = inject(HttpClient);
  private logoutDetectorService = inject(LogoutDetectorService);

  connectionState = signal<'connecting'|'connected'|'disconnected'|'error'>('disconnected');

  constructor() {


    let currentUser = toSignal(this.authService.loggedInUserObs$);

    effect((onCleanup) => {

      if (currentUser() && this.isLoggedStudent(currentUser()!)) {


        this.connectToNotifications(currentUser()!);

      } else {

        this.disconnectFromSSE();
      }

      onCleanup(() => {
        this.disconnectFromSSE();
      })

    }, {allowSignalWrites:true});

    effect(() => {
      if(this.logoutDetectorService.isLogoutDetected()){

        this.disconnectFromSSE();

      }

    },{allowSignalWrites:true} );
   
  }



  public isLoggedStudent(currentUser: User) {

    return currentUser ? currentUser.roles.some(role => role.toLowerCase() === 'student') : false;
  }

  private async connectToNotifications(user: User) {
 
    
     this.disconnectFromSSE();
     this.connectionState.set('connecting');
 
     this.abortController = new AbortController();
 
     const token = user.accessToken;
 
     try{
 
       await fetchEventSource(`${this.notificationUrl}?_xxid=${user.id}`, {
 
         headers: {
           'Authorization': `Bearer ${token}`,
           'Accept': 'text/event-stream',
           'Cache-Control': 'no-cache',
           'Connection': 'keep-alive',
         //  'X-Accel-Buffering':'no'
 
         },
 
         signal: this.abortController.signal,
         openWhenHidden:true,
         onopen: async (response) => {
 
           this.zone.run(() => {
 
             if(response.ok || response.status === 200){
 
              
               this.connectionState.set('connected');
 
             this.retryCount = 0;
 
             return;
 
             
             }else if(response.status >= 400 && response.status < 500 && response.status !== 429){
               
               this.connectionState.set('error');
             }
             
            
 
             //throw new Error(`Connection failed: ${response.status} ${response.statusText}`);
           });
 
         },
 
         onmessage:(event:EventSourceMessage) => {
           
           this.zone.run(() => {
 
             try{
 
               if(event.event === 'notifications'){
 
                
                 const data:_Notification = JSON.parse(event.data);
 
                 
                const index = this.unreadNotifications().findIndex((n) => n.id === data.id);
                if(index === -1){
 
                 
                 this.unreadNotifications.update(prev => [...prev, data]);
                
 
                }
               }
 
             } catch (error) {
               console.error('Error processing event message:', error);
             }
           });
         },
 
         onerror:(err) => {
 
           this.zone.run(() => {
 
             console.error('SSE error', err);
             this.connectionState.set('error');
 
             if(err.name === 'AbortError' && this.maxRetries <  50) return;
 
               this.attemptReconnection(user);
             
           });
         },
 
         onclose: () => {
           this.zone.run(() => {
             this.connectionState.set('disconnected');
 
           
             
           });
         }
       }).catch((err) => {
         this.zone.run(() => {
           console.error('SSE connection closing error:', err);
           this.connectionState.set('error');
         });
       });
     }catch(err){
 
       this.zone.run(() => {
         this.connectionState.set('error');
         console.error('SSE connection failed:', err);
         
       //  this.attemptReconnection(user);
       })
     }
 
   }

   private attemptReconnection(user: User) {
    if (this.retryCount < this.maxRetries) {

      const delay = Math.min(this.baseDelay * 2 ** this.retryCount, 30000);

      this.retryCount++;

      setTimeout(() => this.connectToNotifications(user), delay);
    }else{
      this.disconnectFromSSE();
    }
  }



  // Disconnects  from the SSE notification
  private disconnectFromSSE() {
   
    this.abortController?.abort();
    this.abortController = null;
    this.connectionState.set('disconnected');



  }
 
  // communicates to the server to delete this notification for the particular student id = "studentId".
  // This is to avoid serving stale notification after they have alerad read the notification
  notificationIsRead(notificationId: number, studentId: number): Observable<void> {

    return this.http.patch<void>(`http://localhost:8080/notice/read?studentId=${studentId}`, notificationId);

  }
}




// An object representing the notifications logged in user receive.
// Notification can be for new assessment upload, resut release etc
export type _Notification = {
  id: number,
  type: string,
  metadata: number, //represents ID of what is being notified about(e.g, uploaded assignment, user requesting to join group etc)
  message: string,
  createdAt: string,
  //in the case of notification for request to join new group chat, 'notifier' is the name of the user who wants to join the group chat.
  notifier?: string,
  // for notification that are related to chats messages
  targetGroupChat?:number



}

