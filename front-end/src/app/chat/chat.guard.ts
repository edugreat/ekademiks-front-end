import { inject } from '@angular/core';
import { CanActivateFn, CanDeactivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { NewGroupChatComponent } from './new-group-chat/new-group-chat.component';
import { ConfirmationDialogService } from '../confirmation-dialog.service';
import { take } from 'rxjs';

// route guard that restricts new group chat creation to only logged in students
export const chatGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  
  const router = inject(Router);

  if(authService.isLoggedInStudent) return true;

 else{
  router.navigate(['/error','Anauthorized !']);

  return false;
 }
};
