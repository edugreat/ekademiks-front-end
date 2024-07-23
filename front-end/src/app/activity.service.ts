import { Injectable } from '@angular/core';
import { Subject, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

//service that monitors user's current activities such as assessment submission, logout etc, then notifies subscribers.
//The notification is used to decide if such activities should be allowed to proceed or not.
//For instance, when a decides to logout in the middle of assessment taking, the 'canDeactivate' guard should be notified to no block such action
export class ActivityService {

  //subject that emits user's current action
  private actionSubject = new Subject<string>();

  //users current action
  action = '';

  constructor() { 
  this.actionSubject.asObservable().subscribe(action => this.action = action);

  }

  //updates users current action
  currentAction(action:string){

    this.actionSubject.next(action);
  }
}
