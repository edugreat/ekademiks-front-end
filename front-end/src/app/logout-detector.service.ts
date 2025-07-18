import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})


  // This service is used to detect when the user has logged out and to perform any necessary cleanup(especially, browser cached chat messages)
export class LogoutDetectorService {

  private abortControllerArray:Array<AbortController|null> = [];

  public isLogoutDetected = signal(false); // Flag to indicate if logout has been detected

  constructor() { }


 public  abortControllers(){

  this.abortControllerArray.forEach(controller => {

   
   if(controller){

    controller.abort();
    controller = null;
    
   }
  })
  }

  public addAbortController(controller:AbortController){

    this.abortControllerArray.push(controller);
  }
}
