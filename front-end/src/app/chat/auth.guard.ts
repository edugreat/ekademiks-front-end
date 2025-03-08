import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

// guard that guards against guest users from accessing protected pages. 
export const authGuard: CanActivateFn = () => {

  const router = inject(Router);
  const authService = inject(AuthService);

  // this shows they really took some assessment(indicated by the server delivered cachingKey)
  if(sessionStorage.getItem('cachingKey')){

    return true;
  }else{

    authService.logout();
    router.navigate(['/login']);

    return false;
  }

 
};
