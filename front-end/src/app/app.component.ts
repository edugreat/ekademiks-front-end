import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService, User } from './auth/auth.service';
import { Subscription, take } from 'rxjs';
import { Router } from '@angular/router';
import { ConfirmationDialogService } from './confirmation-dialog.service';
import { ActivityService } from './activity.service';
import { NotificationsService } from './admin/upload/notifications/notifications.service';



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

 currentUser?:User;

 

 currentUserSub?:Subscription;
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private confirmationService: ConfirmationDialogService,
    private activityService:ActivityService,
    private notificationService:NotificationsService  
    
  ) { }
  

  ngOnInit(): void {

   
    this.updateUserName();

    this._currentUser();
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

 
  //log out the user by clearing the session storage
  logout() {
    this.confirmationService.confirmAction('Do you want to logout?');
    this.confirmationService.userConfirmationResponse$.pipe(take(1)).subscribe((yes) => {
      if (yes) {
        //reset the user to the generic 'Student' placeholder name

       

        this.authService.logout();

        this.currentUser = undefined;

       
        
       
       
       
        //this is important incase the user wants to logout in the middle of assessment taking, so the app can allow them to logout
        // without enforcing the canDeactivate route guard
       this.activityService.currentAction('logout');
        this.router.navigate(['login'])
      }
    });
  }

  // returns true if the current user is a guest
  isGuestUser():boolean {
    
    return this.currentUser ? false : true;

    }

  // Checks if the user is a looged in student
  public isLoggedInStudent(): boolean{
  
    return this.currentUser ? this.currentUser.roles.some(role => role.toLowerCase() === 'student') : false;

    
  }

  //checks if the current user is an admin
  public isAdmin():boolean{

    return this.currentUser ? this.currentUser.roles.some(role => role.toLowerCase() === 'admin') : false;

    
  }



  // get the object of logged in user
  private _currentUser(){

    this.authService.loggedInUserObs$.subscribe(user => this.currentUser = user);

    if(this.authService.isLoggedIn && !this.authService.currentUser){

      const cachingKey = sessionStorage.getItem('cachingKey');

      this.currentUserSub = this.authService.cachedUser(cachingKey!).pipe(take(1)).subscribe(user => {

        // log them out and demand they login again
        if(!user){


          this.authService.logout();

          this.router.navigate(['/login'])

        }
      });
    }

   
   

  }

 

 

  // get the number of unread notifications for logged in students
  private countUnreadNotifications(){

  
     

      this.notificationService.notificationCount$.subscribe(unread =>{

        this.unreadNotifications = unread;
      })
    }

    // checks if the current user belongs in any group chat. This is for conditional display of chat functionalities
    get isGroupMemeber(): boolean {
     
      return sessionStorage.getItem('inGroup') !== null;

      }
      

     get isLoggedIn():boolean{

        return sessionStorage.getItem('logged') ? true : false;
      }
     
   
  }


