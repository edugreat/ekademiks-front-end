import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

// guard that guards against guest users from accessing protected pages. 
export const authGuard: CanActivateFn = () => {

  const router = inject(Router);
  const authService = inject(AuthService);

  // this shows a logged in user
  if(authService.currentUser){

    console.log('current user exists')

    return true;
  }else{

    console.log('no current user')
    authService.logout();
    router.navigate(['/login']);

    return false;
  }

 
};
