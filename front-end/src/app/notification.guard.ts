import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth/auth.service';

// Notification guard that ensures only logged in students can have access to notifications
export const notificationGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  // Route the user to the home page if they are not logged in student, else grant them access
  if(! authService.isLoggedInStudent){

    router.navigate(['/home']);
    return false;


  }


  return true;
};
