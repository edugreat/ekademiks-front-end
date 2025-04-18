import { Component, OnDestroy, OnInit } from '@angular/core';
import { TestService } from '../test.service';
import { PerformanceObject } from '../test.component';
import { Router } from '@angular/router';
import { Subscription, take, tap } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { NgIf } from '@angular/common';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { PerformanceReportComponent } from './performance-report/performance-report.component';

@Component({
    selector: 'app-performance',
    templateUrl: './performance.component.html',
    styleUrl: './performance.component.css',
    standalone: true,
    imports: [NgIf, MatRadioGroup, FormsModule, MatRadioButton, MatButton, MatIcon, PerformanceReportComponent]
})



/*
This component displays student's recent assessment performance once it is notified.
It subscribes to the method of the TestService to be notified of the availability of the student's recent performance.
It also declares a method and calls the Testservice method to emit 'true' or 'false'. When 'true' is emitted, the student wants to see their performance, else,they want to take more assessment.
The emission of 'true' or 'false' is due to the student's interraction with the radio button of the view component.
*/
export class PerformanceComponent implements OnInit{


 

  option = '';//student's selected option when interracted with the radio button

  //student's recent performance placeholder, instantiated once the observable emits values
  recentPerformance?:PerformanceObject;

 


  //flag that detects if the student's performance is ready to be displayed
  performanceAvailable = false;

  constructor(private testService: TestService, private authService:AuthService, private router:Router){}


  ngOnInit(): void {

   
    this.testService.submission(false)//notifies 'canDeactivate'that submission is complete. Further navigation out of the TestComponent should be checked
  
  }

 



 performanceOrMoreTest(){

  

  if(this.option === 'true'){
    
    this.showMyRecentAccessPerformance();
  
  }else if(this.option === 'false'){
    
    this.performanceAvailable = false;
  // routes to the home page with parameter 'true' indicating the user wants to take another assessment
  this.router.navigate(['/home/true'])
  }
  
}

//Method that subscribes to observable and listens to know when student wants to see their recent assessment.
showMyRecentAccessPerformance(){

  // const recentPeformance = JSON.parse(sessionStorage.getItem('recent-performance')!);


  // first try accessing recent performance from the in-app service cache
  if(this.testService.recentPerformance){

    this.recentPerformance = this.testService.recentPerformance;

    // enables view display
    this.performanceAvailable = true;

  }else if(sessionStorage.getItem('cachingKey')){

    // extract caching key from browser storage
    const cachingKey:string = sessionStorage.getItem('cachingKey')!;

    // make api get call to the server cache center for users' recent performance
    this.testService.getCachedRecentPerformance(cachingKey).pipe(tap(performance => {

      // make in-app cache of just retrieved user's recent performance to the service.
      this.testService.recentPerformance = performance;
    }),
   take(1)
   ).subscribe(performance => {


       
    this.recentPerformance = performance;

    // flag that initiate view rendering
    this.performanceAvailable = true;

  
   })
  }


  
 
}
}