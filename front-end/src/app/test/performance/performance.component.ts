import { Component, OnDestroy, OnInit } from '@angular/core';
import { TestService } from '../test.service';

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

  constructor(private testService: TestService){}


  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
  }



 performanceOrMoreTest(){

  if(this.option === 'true'){
    //this.testService.showPerformanceOrMoreTest(true);
    console.log(typeof this.option );
  }else{

    console.log(typeof this.option)
   // this.testService.showPerformanceOrMoreTest(false);
  }
  
}
}
