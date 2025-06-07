import { HttpClient } from '@angular/common/http';
import { effect, inject, Injectable, Injector, NgZone, signal } from '@angular/core';
import { AuthService, User } from '../auth/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { EventSourceMessage, fetchEventSource } from '@microsoft/fetch-event-source';
import { LogoutDetectorService } from '../logout-detector.service';

@Injectable({
  providedIn: 'root'
})
export class AdminNotificationsService {

  private connectionUrl = 'http://localhost:8080/admins/assessment/notify_me';

  private retryCount = 0;
  private maxRetries = 50;
  private baseDelay = 1000;
  private abortController:AbortController | null = null;

  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private zone = inject(NgZone);
  private logoutDetectorService = inject(LogoutDetectorService);

  notifications = signal<AssessmentResponseRecord[]>([]);


// indicates user connection state
  connectionState = signal<'disconnected'|'connected'|'connecting'|'error'>('disconnected');

  constructor() {


      const currentUser = toSignal(this.authService.loggedInUserObs$);

      effect((onCleanup) => {

        const user = currentUser?.();

        if(user && this.isAdminUser(user)){

          

          this.connectToNotifications(user)
        } else {

          this.disconnectFromSSE();
        }


        onCleanup(() => {
          this.disconnectFromSSE();
        }
        )
      }, {allowSignalWrites:true});
   
      effect(() => this.logoutDetectorService.isLogoutDetected() ? this.disconnectFromSSE() : '')
      
     }

    //  disconnect from SSE notifications
  disconnectFromSSE() {
    
   this.abortController?.abort();
   this.abortController = null;
   this.connectionState.set('disconnected');
  }
  private async connectToNotifications(user: User) {


    this.disconnectFromSSE();
    this.connectionState.set('connecting');

    this.abortController = new AbortController();

    const token = user.accessToken;

    try{

      await fetchEventSource(`${this.connectionUrl}?_xxid=${user.id}`, {

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

            if(response.ok && response.status === 200){


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

              if(event.event === 'responseUpdate'){

                const data:AssessmentResponseRecord = JSON.parse(event.data);

               const index = this.notifications().findIndex((n) => n.topic === data.topic && n.instructorId === data.instructorId && n.postedOn === data.postedOn);
               if(index === -1){

                this.notifications.update(prev => [...prev, data]);
               

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

            if(err.name === 'AbortError') {
              this.disconnectFromSSE();

              return;
            }

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

      const delay = Math.min(this.baseDelay * 2 ** this.retryCount, 45000);

      this.retryCount++;

      setTimeout(() => this.connectToNotifications(user), delay);
    }else{
      this.disconnectFromSSE();
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

