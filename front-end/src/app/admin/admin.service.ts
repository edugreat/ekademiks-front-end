import { HttpClient, HttpHeaders, HttpStatusCode} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TestDTO } from './upload/upload-test.component';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private setTestUrl = 'http://localhost:8080/admins/test';

  private levelUrl = 'http://localhost:8080/learning/levels'; //HATEOAS LINK

  // Observable that emits the number of tasks completed
  // This is itended to use in a mat-stepper to indicate progress on tasks such as assessment upload, result uploads tasks etc
  private taskMilestone = new BehaviorSubject<number>(0);

   taskMilestoneObs$ = this.taskMilestone.asObservable();

  
  // Emits the name of task at hand
  private task = new BehaviorSubject<string>('');

  taskObs$ = this.task.asObservable();



  

  constructor(private http:HttpClient) { }

  //Fetches from the database, all the assessment categories
  fetchCategory():Observable<any>{

    return this.http.get<CategoryObject>(this.levelUrl);
  }

  //uses the url 'subjects.href' url returned from the call the fetchCategory to fetch all the subjects in that category
  fetchSubjects(url:string):Observable<any>{

    return this.http.get<SubjectObject>(url);
  }

  // method that posts new created assessment to the server
  postAssessment(test:TestDTO):Observable<HttpStatusCode>{

    return this.http.post<HttpStatusCode>(this.setTestUrl, test);


  }

  // post or associate instructional guide to a just posted assessment
  setInstruction(instruction: {instructions:[]}):Observable<any>{

    return this.http.patch(this.setTestUrl, instruction)


  }

  // Sets step(ie the milestone reached so far) of the task that have been completed so far
   setTaskMilestone(milestone:number):void{

    this.taskMilestone.next(milestone);
  }

  // Sets description about the task at hand
  taskDescription(name:string){

    this.task.next(name);
  }

}

//an object of the 'levelUrl' HATEAOS
export interface CategoryObject{

  _embedded:{
   levels:Array<links>
  }
}

type  links = 
  {
   category:string,
   _links:{
    subjects:{
      href:string
    }
   }
  }

  export interface SubjectObject{

    _embedded:{
      subjects:Array<{subjectName:string}>
    }
  }


