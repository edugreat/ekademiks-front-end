import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { ConfirmationDialogService } from './confirmation-dialog.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  userName = 'Student'; //If the user's name remains Student as initially emitted from the authentication service, then it's a guest user otherwise, it is a logged in user

  userSub?: Subscription; //subscription that receives the currently logged in user's name (their first name)

  constructor(
    private authService: AuthService,
    private router: Router,
    private confirmationService: ConfirmationDialogService
  ) {}

  ngOnInit(): void {
    this.updateUserName();
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }
  title = 'front-end';

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
    this.confirmationService.confirmText('Do you want to logout?');
    this.confirmationService.confirm$.subscribe((yes) => {
      if (yes) {
        //reset the user to the generic 'Student' placeholder name
        this.authService.logout();
        this.router.navigate(['login'])
      }
    });
  }
}
