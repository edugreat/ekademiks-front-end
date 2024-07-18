
import { CanDeactivateFn, Router } from '@angular/router';
import { TestService } from '../test/test.service';
import { inject } from '@angular/core';
import { ConfirmationDialogService } from '../confirmation-dialog.service';
import { TestComponent } from '../test/test/test.component';


//Thi navigation guard basically monitors students routing
export const navigationGuard: CanDeactivateFn<TestComponent> = () => {

  //injects the test service to get notification on the test commencement status
  const testService = inject(TestService);

  //injects the confirmation service to send and receive confirmation notifications
  const confirmationService = inject(ConfirmationDialogService);

  //injects the router for navigation
  const router =  inject(Router);

 return new Promise<boolean>((resolve) => {


  
   
   if(!testService.forSubmission){

     
    confirmationService.confirmText(`Assessment not completed! \nAre you sure to leave?`.replace(/\n/g, '<br>'));

    confirmationService.confirm$.subscribe((response) => {
      resolve(response);
    });
   }else resolve(true)
   
  

 })

 
};
