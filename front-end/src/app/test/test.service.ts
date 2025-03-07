import { Injectable } from '@angular/core';
import { QuestionDTO, QuestionPart, TestContent, TestContentDTO } from './test-interface';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, Subscription, map, tap } from 'rxjs';
import { PerformanceObject } from './test.component';
import { Endpoints } from '../end-point';

@Injectable({
  providedIn: 'root'
})
export class TestService {
  
 

 //the submitting subject emits true or either student's or system initiated assessment submission
 //This is to notify the 'canDeactivate' guard not to block navigation.
 private submissionSubject = new BehaviorSubject<boolean>(false);

 //boolean flag that shows when user's route navigation is due to assessment submission. This is basically to prevent the 'canDeactivate from blocking navigation
 forSubmission = false;

  // provides in-app cache for student's recent performance just to minimize api call to the server's cache center
  private _recentPerformance?:PerformanceObject;
 
  constructor(private http:HttpClient, private endpoints:Endpoints) {
    this.submissionSubject.asObservable().subscribe(value => this.forSubmission = value)
   }



getTest(topic:string, category:string):Observable<TestContent>{

  return this.http.get<TestContentDTO>(`${this.endpoints.baseTestUrl}?topic=${topic}&category=${category}`).pipe(
    tap(dto => sessionStorage.setItem("testId", dto.testId+"")), 
    map(dto => this.convertToTestContent(dto)),
  )
}

//helper method to transform the Question dto object fetched from the server side to the question object to display on th front end

private convertToQuestionPart(dto: QuestionDTO): QuestionPart {
  return {
    number: dto.questionNumber,
    problem: dto.question,
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
submitTest(attempt:Attempt):Observable<{message:string}>{

  return this.http.post<{message:string}>(this.endpoints.submissionUrl, attempt);
}



//notifies subscribers, especially the 'canDeactivate' guard that navigation should be allowed due to assessment submission
submission(value:boolean){

  this.submissionSubject.next(value)
}

saveRecentPerformanceToCache(recentPerformance: PerformanceObject, cachingKey:number):Observable<void> {
 
  return this.http.post<void>(`${this.endpoints.recentPerformanceUrl}?key=${cachingKey}`, recentPerformance);
}


public getCachedRecentPerformance(cachingKey:number):Observable<PerformanceObject>{

  return this.http.get<PerformanceObject>(`${this.endpoints.recentPerformanceUrl}?key=${cachingKey}`)


}


public set recentPerformance(performance:PerformanceObject){

  this._recentPerformance = performance;
}

public get recentPerformance():PerformanceObject | undefined{

  return this._recentPerformance;
}
// Method that retrieves an object whose key is the subject name and value is the category using the given test id
subjectAndCategory(testId:number):Observable<HttpResponse<{[key:string]:string}>>{

  return this.http.get<{[key:string]:string}>(`http://localhost:8080/tests/subject_category?testId=${testId}`, {observe:'response'})
}

}

//object showing id of the student who made the attempt, the id of the test and the attempts made
export interface Attempt{

  testId:number,
  studentId:number,
  selectedOptions:string[]
}

