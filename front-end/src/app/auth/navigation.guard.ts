
import { CanDeactivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { ConfirmationDialogService } from '../confirmation-dialog.service';
import { TestComponent } from '../test/test/test.component';
import { ActivityService } from '../activity.service';


//Thi navigation guard basically monitors students routing
export const navigationGuard: CanDeactivateFn<TestComponent> = () => {

  //injects the test service to get notification on the test commencement status
  const activityService = inject(ActivityService);

  //injects the confirmation service to send and receive confirmation notifications
  const confirmationService = inject(ConfirmationDialogService);

  //injects the router for navigation
  const router =  inject(Router);

 return new Promise<boolean>((resolve) => {

 const ALLOWABLE = ['submission', 'logout'];
  
   //if the user's current action is not any of the allowable actions, then ask the user to confirm their action
   if(! ALLOWABLE.some(action => action === activityService.action)){

    
    confirmationService.confirmText(`Assessment not completed! \nAre you sure to leave?`.replace(/\n/g, '<br>'));
   
    confirmationService.confirm$.subscribe((response) => {
      resolve(response);
    });
   }else{

    //the user has completed their current action for which they intend to navigate away at the middle of assessment taking
    activityService.currentAction('');
     resolve(true);

   }
   
  

 })

 
};
