import { Injectable } from '@angular/core';
import { QuestionDTO, QuestionPart, TestContent, TestContentDTO } from './test-interface';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { PerformanceObject } from './test/test.component';

@Injectable({
  providedIn: 'root'
})
export class TestService {

  //routes to the backend server to fetch test based on the request parameters
 private baseTestUrl = 'http://localhost:8080/tests/start';
 private submissionUrl = 'http://localhost:8080/tests/submit';

 private performanceSubject:BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);//emits true to notify subscribers that the student wishes to see their assessment performance. If it emits false, then it means the student wishes to take another assessment instead of seeing their recent performance

 public performanceObs$:Observable<boolean> = this.performanceSubject.asObservable(); //for proper encapsulation of the functionality of the performanceSubject

 //subject that emits student's recent performance.
 private recentPerformanceSubject:BehaviorSubject<PerformanceObject> = new BehaviorSubject<PerformanceObject>({} as PerformanceObject);

 public recentPerformanceObs$:Observable<PerformanceObject> = this.recentPerformanceSubject.asObservable();//for peoper encapsulation of the recentPerformance subject
  constructor(private http:HttpClient) { }



getTest(topic:string, category:string):Observable<TestContent>{

  return this.http.get<TestContentDTO>(`${this.baseTestUrl}?topic=${topic}&category=${category}`).pipe(
    tap(dto => sessionStorage.setItem("testId", dto.testId+"")), 
    map(dto => this.convertToTestContent(dto)),
  )
}

//helper method to transform the Question dto object fetched from the server side to the question object to display on th front end

private convertToQuestionPart(dto: QuestionDTO): QuestionPart {
  return {
    number: dto.questionNumber,
    problem: dto.text,
    answer: dto.answer,
    options: dto.options
  };
}



private convertToTestContent(dto: TestContentDTO): TestContent {
  return {
    questions: dto.questions.map(this.convertToQuestionPart),
    instructions: dto.instructions
  };
}

//submit the test response to the back-end
submitTest(attempt:Attempt):Observable<string>{

  return this.http.post<string>(this.submissionUrl, attempt);
}

//emits true to subscribers to show the student want to see their recent performance. Emitting false shows the student would like to take another test
showPerformanceOrMoreTest(value:boolean){

  this.performanceSubject.next(value);
}

//emits student's recent performance to subscribers
showRecentPerformance(recentPerformance:PerformanceObject){

  this.recentPerformanceSubject.next(recentPerformance);
}
}

//object showing id of the student who made the attempt, the id of the test and the attempts made
export interface Attempt{

  testId:number,
  studentId:number,
  selectedOptions:string[]
}


