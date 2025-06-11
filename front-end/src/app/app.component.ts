import { AfterViewInit, Component, computed, effect, forwardRef, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { interval, Subscription, take } from 'rxjs';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { ConfirmationDialogService } from './confirmation-dialog.service';
import { ActivityService } from './activity.service';
import { NotificationsService } from './admin/upload/notifications/notifications.service';

import { CommonModule } from '@angular/common';
import { ConfirmationComponent } from './shared';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdminNotificationsService } from './admin/admin-notifications.service';
import { toSignal } from '@angular/core/rxjs-interop';


@Component({
  standalone: true,
  imports:[
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
    MatBadgeModule,
    MatSidenavModule,
    RouterLink,
    RouterOutlet,
    ConfirmationComponent,
    forwardRef(() => AdminNotificationIndicatorComponent),
  ],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {

  userName = 'Student'; //If the user's name remains Student as initially emitted from the authentication service, then it's a guest user otherwise, it is a logged in user

  userSub?: Subscription; //subscription that receives the currently logged in user's name (their first name)

  

  

 public loggedIn = signal(false);
 private authService = inject(AuthService);
 private router = inject(Router);
 private confirmationService = inject(ConfirmationDialogService);
 private activityService = inject(ActivityService);
 private notificationService = inject(NotificationsService);


 // one-time subscription to logged in user object
 currentUser = toSignal(this.authService.loggedInUserObs$);

// The number of unread notifications
protected unreadNotificationsCount = computed(() => this.notificationService.notificationCount());

// shows network connection state(espacially for notifications)
connectionState = computed(() => this.notificationService.connectionState());

// property that emits a period at fixed interval when network reconnections are being processed
private x = ['.', '.', '.'];

 networkBusyIndicator = '';
 
 notificationMsg = '';

 
  constructor() {

    effect(() => {

     if(this.currentUser()){

      this.loggedIn.set(true);


     }else if(!this.currentUser() && this.authService.isLoggedIn){

      // fetch current user from server's cache system
     const  cachingKey = sessionStorage.getItem('cachingKey');

    this.authService.cachedUser(cachingKey!).subscribe();

     if(!this.currentUser()){


      //finally, the user is logged out
      this.loggedIn.set(false);
      
     }
     }else{
      this.loggedIn.set(false);
      
     }




    const count = this.unreadNotificationsCount();
    const wordCount = count > 1 ? 'notifications' : 'notification';

     this.notificationMsg =  count > 0 ? `You have ${count} unread ${wordCount}` : `No new notifications`;



    if (this.connectionState() === 'connecting') {
    
        interval(500).subscribe(() =>{

         if(this.x.length > 0){

          this.networkBusyIndicator = `${this.networkBusyIndicator}  ${this.x.pop()}`;
         }else{

          this.networkBusyIndicator = '';
          this.x = ['.','.','.'];
         }
        })

        
    }

    },{allowSignalWrites:true});


   }
  

  ngOnInit(): void {

    
   
    this.updateUserName();

    //this._currentUser();
  
  }

  ngAfterViewInit(): void {
   
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
   
   
  }
 

  //updates the 'userName' field with the currently logged in user's first name
  updateUserName() {
    this.userSub = this.authService.userName$.subscribe((name) => {
      this.userName = name;
    });
  }

 
  //log out the user by clearing the session storage
  logout() {
    this.confirmationService.confirmAction('Do you want to logout?');
    this.confirmationService.userConfirmationResponse$.pipe(take(1)).subscribe((yes) => {
      if (yes) {
        //reset the user to the generic 'Student' placeholder name

       

        this.authService.logout();
        //this is important incase the user wants to logout in the middle of assessment taking, so the app can allow them to logout
        // without enforcing the canDeactivate route guard
       this.activityService.currentAction('logout');
        this.router.navigate(['login'])
      }
    });
  }

  // returns true if the current user is a guest
  isGuestUser():boolean {
    
    return this.currentUser() ? false : true;

    }

  // Checks if the user is a looged in student
  public isLoggedInStudent(): boolean{
  
    return this.currentUser() ? this.currentUser()!.roles.some(role => role.toLowerCase() === 'student') : false;

    
  }

  //checks if the current user is an admin
  public isAdmin():boolean{

    return this.currentUser() ? this.currentUser()!.roles.some(role => role.toLowerCase() === 'admin') : false;

    
  }

 

    // checks if the current user belongs in any group chat. This is for conditional display of chat functionalities
    get isGroupMemeber(): boolean {
     
     if(this.currentUser()) return this.currentUser()!.isGroupMember;

     return false;

      }
      

   
     
   
  }

  // component provides customized notificaton icon on the tool bar

  @Component({
    selector: 'admin-notifier',

    
    template: `
      <div class="notification-container">
       @if(!unreadNotifications()){
        <button  [matTooltip]="notificationCountMsg" [routerLink]="['/admin/notifications']" routerLinkActive="router-link-active"  mat-icon-button class="notification-button">
          <mat-icon  >notifications</mat-icon>
        </button>
       }
       @if(unreadNotifications()){
        <button [matTooltip]="notificationCountMsg" [routerLink]="['/admin/notifications']" mat-icon-button class="notification-button" matBadge="{{ unreadNotifications() }}" matBadgeColor="warn">
          <mat-icon>notifications_active</mat-icon>
        </button>
       }

      <div id="connectionState" >

      @if(connectionState() === 'connected'){

        <span matTooltip="connected" >
          <mat-icon class="connected" >signal_wifi_4_bar</mat-icon>
        </span>
      }

      @if(connectionState() === 'connecting'){
       <span class="connecting" >reconnecting {{networkBusyIndicator}}</span>
      }

      @if(connectionState() === 'disconnected'){

        <span matTooltip='disconnected' class="disconnected" >
        <mat-icon  >signal_wifi_4_bar</mat-icon>
        </span>
      }

      @if(connectionState() === 'error'){
            <span matTooltip="unstable connection" class="disconnected" >
            <mat-icon  >signal_wifi_statusbar_not_connected</mat-icon>
            </span>
          }
      </div>
      </div>
    `,
    standalone: true,
    imports: [MatIconModule, MatBadgeModule, CommonModule, RouterLink, MatTooltipModule],
    styles: [
      `
        .notification-container {
          display: flex;
          align-items: center;
          gap: 4px;
        }
  
        .notification-button {
          background-color: #f5f5f5;
          border-radius: 50%;
          padding: 4px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
  
        .notification-button:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        }
  
        .notification-button mat-icon {
          font-size: 24px;
          color: #3f51b5;
        }
  
        .notification-button[matBadge] {
          position: relative;
        }

        .connecting{
          color:rgb(243, 239, 23);;
        }

        .disconnected{
          color:rgb(181, 63, 108);;
        }

        .connected{

          color: #FFFFFF
        }
        #connectionState{

          margin-left:10px;
        }
      `,
    ],
  })
  export class AdminNotificationIndicatorComponent implements OnDestroy{
   
    

   

    private notificationService = inject(AdminNotificationsService);

    protected unreadNotifications  =  computed(() => this.notificationService.notifications().length);
    protected connectionState =  computed(()=> this.notificationService.connectionState() );

    networkBusyIndicator = '';

     x = ['.','.','.'];


    //  indicates how many unread notifications the user has
     notificationCountMsg = '';
   
    constructor() {



      effect(() => {

        const count = this.unreadNotifications();
        const wordCount = count > 1 ? 'notifications' : 'notification';
        this.notificationCountMsg = count > 0 ? `You have ${count} unread ${wordCount}` : 'No new notifications';
        
          
        if(this.connectionState() === 'connecting'){
          interval(500).subscribe(() => {

           if(this.x.length > 0){
            this.networkBusyIndicator = this.networkBusyIndicator+=` ${this.x.pop()}`;
           }else{

            this.networkBusyIndicator = '';
            this.x =  ['.','.','.'];
           }

          })

        };

       
      })


    }

    
  
    ngOnDestroy(): void {
    
    }
  
  }


