import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationDialogService {

  //subject that emits confirmation messages that the user should consent to or decline, pending an action
  private actionMessageConfirmation = new Subject<string>();

  //subject that emits the user response to confirmation dialog
  private userConfirmationResponse = new Subject<boolean>();

  //gets observable from the subject that subscribers can subscribe to, to receive emitted values from the actionMessageConfirmation
  actionMessageConfirm$ = this.actionMessageConfirmation.asObservable();

  //get observable from the subject that subscribers can subscribe to, to receive emitted values (such as user's confirmation response) from the userConfirmationResponse
  userConfirmationResponse$ = this.userConfirmationResponse.asObservable();

  constructor() { }

  //emits the confirmation message
  confirmAction(message:string){

    this.actionMessageConfirmation.next(message);
  }

  //emits user confirmation response
  confirmationResponse(response:boolean){

    this.userConfirmationResponse.next(response);

  }
}
