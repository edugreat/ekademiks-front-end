import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { Subscription, take } from 'rxjs';
import { Router } from '@angular/router';
import { ConfirmationDialogService } from './confirmation-dialog.service';
import { ActivityService } from './activity.service';
import { NotificationsService } from './admin/upload/notifications/notifications.service';
import { ChatService } from './chat/chat.service';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {

  userName = 'Student'; //If the user's name remains Student as initially emitted from the authentication service, then it's a guest user otherwise, it is a logged in user

  userSub?: Subscription; //subscription that receives the currently logged in user's name (their first name)

  // The number of unread notifications
  unreadNotifications = 0;
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private confirmationService: ConfirmationDialogService,
    private activityService:ActivityService,
    private notificationService:NotificationsService,
    private chatService:ChatService
 
  
    
  ) {}
  

  ngOnInit(): void {
    this.updateUserName();
   this.authService.studentLoginObs$.subscribe(isLoggedIn =>{

    if(isLoggedIn){
      this.countUnreadNotifications();
    }
   })
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

  //checks if the user is already logged in so as to hide the login button
  loggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  //log out the user by clearing the session storage
  logout() {
    this.confirmationService.confirmAction('Do you want to logout?');
    this.confirmationService.userConfirmationResponse$.pipe(take(1)).subscribe((yes) => {
      if (yes) {
        //reset the user to the generic 'Student' placeholder name

       if(this.isLoggedInStudent()){

        this.disconnectFromServer();
        
       }else{

        this.authService.logout();
       }
       
       

        //this is important incase the user wants to logout in the middle of assessment taking
       this.activityService.currentAction('logout');
        this.router.navigate(['login'])
      }
    });
  }

  // returns true if the current user is a guest
  isGuestUser() {
    
    return !this.authService.isLoggedIn();
    }

  // Checks if the user is a looged in student
  isLoggedInStudent(){

   return this.authService.isLoggedInStudent();

  }

  //checks if the current user is an admin
  isAdmin(){

    return this.authService.isAdmin();
  }

  // get the number of unread notifications for logged in students
  private countUnreadNotifications(){

  
     

      this.notificationService.notificationCount$.subscribe(unread =>{

        this.unreadNotifications = unread;
      })
    }

    // checks if the current user belongs in any group chat. This is for conditional display of chat functionalities
    isGroupMemeber(): boolean {
     
     
     
      return this.authService.isAgroupMember();

      }
      
      // returns current loggedin student's id
     public get studentId():number{

        return Number(sessionStorage.getItem('studentId'));
      }

      // disconnects the user from server's SSE
      private disconnectFromServer(){

        this.authService.disconnectFromServer(this.studentId).pipe(take(1)).subscribe({
         
          complete:() => {

            // disconnects the user from further receiving chat messages
            this.chatService.disconnectFromSSE();

             // disconnects the user from further receiving notification messages
            this.notificationService.disconnectFromSSE();

            // finally logs the student out
            this.authService.logout();

          }

        });

      }
  }


