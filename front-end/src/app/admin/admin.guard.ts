import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

// if the user is not a logged in user with the 'admin' role, redirect them to the login page, otherwise allow them
export const adminGuard: CanActivateFn | CanActivateChildFn | CanMatchFn = () => {

  
 return isAdmin();
 
};


const isAdmin = () =>{
  const router = inject(Router);

  const authService = inject(AuthService)

  if((authService.isAdmin)){
    return true
  }else{
  
    authService.logout();
    router.navigate(['login']);
  }

 
  
  return false;

}