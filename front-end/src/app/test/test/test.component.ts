import { Component, OnDestroy, OnInit } from '@angular/core';
import { TestService } from '../test.service';
import { Question } from '../test-interface';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { MediaService } from '../../media-service';
import { MediaChange } from '@angular/flex-layout';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrl: './test.component.css'
})
export class TestComponent implements OnInit, OnDestroy{

questions: Question[] = [];


//The current time left before the time alloted to complete the test
timeLeft = 0;

//to be unsubscribed when the template is destroyed
questionSub:Subscription | undefined;

topic = ''; //the topic the student selected for assessment

subject = ''; //subject for which the test assessment is based
//options selected by the students
selectedOptions:any[] = [];


//boolean flag showing whether the user's screen is small
smallScreen = false;
 

  constructor(private testService:TestService,
    private activatedRoute:ActivatedRoute,
    private mediaService:MediaService
  ){}

  ngOnInit(): void {
   this.getQuestions();
   this.mediaAlias();
  }

  ngOnDestroy(): void {
    
    this.questionSub?.unsubscribe();
  }

  //calls the getTest() of Test service to fetch all the questions for the given assessment
  getQuestions(){

  this.topic = this.activatedRoute.snapshot.params['topic'];
  this.subject = this.activatedRoute.snapshot.params['subject'];
  const category = this.activatedRoute.snapshot.params['category'];


  if(this.topic && category){

   this.questionSub =  this.testService.getTest(this.topic, category).subscribe(questions => {

    this.questions = questions;
    //selected options initialized to null
    this.selectedOptions = new Array(this.questions.length).fill(null);

    this.timeLeft = this.activatedRoute.snapshot.params['duration'];
    console.log('time left = '+this.timeLeft)
   });
  }
  
}

//submits the test assessment after the time elapses
//Reminder: Reimplement to send to database after time elapses or user submits willingly
submit() {

  const attempted = this.selectedOptions.some(option => option !== null);
  

  if(attempted){

    this.selectedOptions.forEach(option => console.log(option))
  }else console.log('No attempts made yet!')
  }

//checks the screen size of the current user and update the 'smallScreen' boolean flag
private mediaAlias(){

  return this.mediaService.mediaChanges().subscribe((changes:MediaChange[]) =>{

    this.smallScreen = changes.some(change => change.mqAlias === 'xs' || change.mqAlias === 'sm');
    changes.forEach(c => console.log(c.mqAlias));
  })
}

}


//TODO: Implement the timer
