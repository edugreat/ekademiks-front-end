import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { TestService } from '../test.service';
import { PerformanceObject } from '../test/test.component';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-performance',
  templateUrl: './performance.component.html',
  styleUrl: './performance.component.css'
})



/*
This component displays student's recent assessment performance once it is notified.
It subscribes to the method of the TestService to be notified of the availability of the student's recent performance.
It also declares a method and calls the Testservice method to emit 'true' or 'false'. When 'true' is emitted, the student wants to see their performance, else,they want to take more assessment.
The emission of 'true' or 'false' is due to the student's interraction with the radio button of the view component.
*/
export class PerformanceComponent implements OnInit, OnDestroy {


 

  option = '';//student's selected option when interracted with the radio button

  //student's recent performance placeholder, instantiated once the observable emits values
  recentPerformance?:PerformanceObject;



  //flag that detects if the student's performance is ready to be displayed
  performanceAvailable = false;

  constructor(private testService: TestService){}


  ngOnInit(): void {

    this.testService.submission(false)//notifies 'canDeactivate'that submission is complete. Further navigation out of the TestComponent should be checked
    this.showMyRecentAccessPerformance();
    
   
  }

  ngOnDestroy(): void {
   
  }



 performanceOrMoreTest(){

  

  if(this.option === 'true'){
    //this.testService.showPerformanceOrMoreTest(true);
    this.performanceAvailable = true;
    this.testService.showMyRecentPerformance();//notifies subscriber that the student would like to see their recent performance
  
  
  }else if(this.option === 'false'){
    
    this.performanceAvailable = false;
    this.testService.takeMoreTest()//notifies subscribers that student would like to take more assessment instead
   
  }
  
}

//Method that subscribes to observable and listens to know when student wants to see their recent assessment.
showMyRecentAccessPerformance(){

  this.testService.myRecentPerformanceObservable().subscribe( {
  next:(performance:PerformanceObject) => {
   

   this.recentPerformance = performance;
    this.performanceAvailable = true;

  }    
  })
}
}