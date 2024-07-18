import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationDialogService {

  //subject that emits confirmation messages to display on the confirmation dialog
  private messageSubject = new Subject<string>();

  //subject that emits the user response to confirmation dialog
  private confirmSubject = new Subject<boolean>();

  //gets observable from the subject that subscribers can subscribe to, to receive emitted values from the messageSubject
  message$ = this.messageSubject.asObservable();

  //get observable from the subject that subscribers can subscribe to, to receive emitted values from the confirmSubject
  confirm$ = this.confirmSubject.asObservable();

  constructor() { }

  //emits the confirmation message
  confirmText(message:string){

    this.messageSubject.next(message);
  }

  //emits user confirmation response
  confirmationResponse(response:boolean){

    this.confirmSubject.next(response);

  }
}
