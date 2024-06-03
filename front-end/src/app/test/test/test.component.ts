import { Component, OnDestroy, OnInit } from '@angular/core';
import { TestService } from '../test.service';
import { Question } from '../test-interface';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrl: './test.component.css'
})
export class TestComponent implements OnInit, OnDestroy{
submitQuiz() {
throw new Error('Method not implemented.');
}


  topic = '';
  category = '';

 subscription:Subscription | undefined;

questions: Question[] = [];
selectedOptions:Array<string> = [];

  constructor(private testService:TestService, 
    private activatedRoute:ActivatedRoute){}

  ngOnInit(): void {
   this.getQuestions();
  }

  ngOnDestroy(): void {
    
    this.subscription?.unsubscribe();
  }




getQuestions(){

  this.topic = this.activatedRoute.snapshot.params['topic'];
  this.category = this.activatedRoute.snapshot.params['category'];
  if(this.topic && this.category){

    console.log(this.topic)

   this.subscription = this.testService.getTest(this.topic,this.category).subscribe(questions =>{

    this.questions = questions;
    this.selectedOptions = new Array(this.questions.length).fill(null);
   })
  }

  //return this.testService.getTest(this.topic, this.category).subscribe(questions => this.questions = questions);
}

}
