import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

// guard that guards against guest users from accessing protected pages. 
export const authGuard: CanActivateFn = () => {

  const router = inject(Router);
  const authService = inject(AuthService);

  if(authService.isLoggedIn()){

    return true;
  }else{

    router.navigate(['/login']);

    return false;
  }

 
};
