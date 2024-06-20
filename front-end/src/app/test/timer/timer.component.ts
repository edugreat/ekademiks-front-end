import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.css'
})

//Takes care of providing functionalities for assesment timing
export class TimerComponent implements OnInit, OnDestroy{

  @Input() testDuration: number = 0;//input variable for time left, updated by the parent component's test duration variable

  timer:any;
  
 durationElapsing = false //boolean flag that shows if time remaining is small or not. It used to 
 
 isOneMinuteRemaining = false; //whether 1 minute is remaining

 @Output() timeUp = new EventEmitter<boolean>(); //to emits true when time remaining is one second

  ngOnInit(): void {
    this.startTimer();
    
  }

  ngOnDestroy(): void {

    clearInterval(this.timer);
    
  }

  //start counting time for test submission
  startTimer(){

   this.timer =  setInterval(() => {

      if(this.testDuration > 0) {

        const timeRemaining = Math.floor(this.testDuration / 60);

        if(timeRemaining  <= 5 ){
          this.durationElapsing = true //sets true if remaining time <= 5 minutes
        } 

        if(timeRemaining <= 0) this.isOneMinuteRemaining = true; //sets true if exactly one minute of time or less is remaining

        this.testDuration--; //decrements the duration by one second
      }
      else {

        this.timeUp.emit(true);//emits true to show that time is up
        this.testDuration = 0;
        clearInterval(this.timer) //clear the timer
        


      } 
    }, 180000); // 3 minutes
  }


  


}
