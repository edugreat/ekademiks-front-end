import { Injectable } from '@angular/core';
import { QuestionDTO, QuestionPart, TestContent, TestContentDTO } from './test-interface';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, Subscription, map, tap } from 'rxjs';
import { PerformanceObject } from './test.component';

@Injectable({
  providedIn: 'root'
})
export class TestService {

  //routes to the backend server to fetch test based on the request parameters
 private baseTestUrl = 'http://localhost:8080/tests/start';
 private submissionUrl = 'http://localhost:8080/tests/submit';

 //emits true to notify subscribers that the student wishes to see their assessment performance. If it emits false, then it means the student wishes to take another assessment instead of seeing their recent performance
 private performanceOrMoreTestSubject:Subject<boolean> = new Subject<boolean>();
 
 //subject that emits student's recent performance.
 private recentPerformanceSubject:Subject<PerformanceObject> = new Subject<PerformanceObject>();

 //the submitting subject emits true or either student's or system initiated assessment submission
 //This is to notify the 'canDeactivate' guard not to block navigation.
 private submissionSubject = new BehaviorSubject<boolean>(false);

 //boolean flag that shows when user's route navigation is due to assessment submission. This is basically to prevent the 'canDeactivate from blocking navigation
 forSubmission = false;
 
  constructor(private http:HttpClient) {
    this.submissionSubject.asObservable().subscribe(value => this.forSubmission = value)
   }



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
submitTest(attempt:Attempt):Observable<{message:string}>{

  return this.http.post<{message:string}>(this.submissionUrl, attempt);
}

//emits true to subscribers to show the student want to see their recent performance. 
showMyRecentPerformance(){

  this.performanceOrMoreTestSubject.next(true);
}

//Emits false to show the student would like to take another test
takeMoreTest(){
this.performanceOrMoreTestSubject.next(false);

}

//provide an observable for the 'performanceOrTest' subject for proper encapsulation
ShowMyPerformanceOrTakeMoreTestObservable():Observable<boolean>{

return this.performanceOrMoreTestSubject.asObservable();
}

//emits student's recent performance to subscribers
showRecentPerformance(recentPerformance:PerformanceObject){

  this.recentPerformanceSubject.next(recentPerformance);
}

//provide an observable for the 'recentPerformanceSubject' subject for proper encapsulation
myRecentPerformanceObservable():Observable<PerformanceObject>{

  return this.recentPerformanceSubject.asObservable();
}

//notifies subscribers, especially the 'canDeactivate' guard that navigation should be allowed due to assessment submission
submission(value:boolean){

  this.submissionSubject.next(value)
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

