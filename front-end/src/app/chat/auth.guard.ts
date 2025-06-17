import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';

// guard that guards against guest users from accessing protected pages. 
export const authGuard: CanActivateFn = () => {

  const router = inject(Router);
  const authService = inject(AuthService);

  const isLoggedIn = toSignal(authService.loggedInUserObs$);

  // this shows a logged in user
  if(isLoggedIn()){

    return true;
  }else{

    
    authService.logout();
    router.navigate(['/login']);

    return false;
  }

 
};
