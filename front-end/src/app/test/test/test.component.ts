import { Component, OnInit } from '@angular/core';
import { TestService } from '../test.service';
import { Question } from '../test-interface';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrl: './test.component.css'
})
export class TestComponent implements OnInit{
questions:Question[] = [];

  constructor(private testService:TestService){}

  ngOnInit(): void {
   this.getQuestions();
  }


getQuestions(){

  return this.testService.getTest().subscribe(questions => this.questions = questions);
}

}
