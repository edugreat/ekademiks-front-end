import { HttpClient, HttpHeaders, HttpResponse, HttpStatusCode} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { TestDTO } from './upload/upload-test.component';
import { NotificationDTO } from './upload/notifications/notifications.component';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private setTestUrl = 'http://localhost:8080/admins/test';

  // HATEOAS LINK
  private levelUrl = 'http://localhost:8080/learning/levels'; 

  private notificationUrl = 'http://localhost:8080/admins/notify';

  // HATEOAS LINK
  private  studenListUrl = 'http://localhost:8080/learning/students';

  // Observable that emits the number of tasks completed
  // This is itended to use in a mat-stepper to indicate progress on tasks such as assessment upload, result uploads tasks etc
  private taskMilestone = new BehaviorSubject<number>(0);

   taskMilestoneObs$ = this.taskMilestone.asObservable();

  
  // Emits the name of task at hand
  private task = new BehaviorSubject<string>('');

  taskObs$ = this.task.asObservable();

  // Tasks milestone initialized to zero
  private _milestone = 0;



  

  constructor(private http:HttpClient) { }

  //Fetches from the database, all the assessment categories
  fetchCategory():Observable<any>{

    return this.http.get<CategoryObject>(this.levelUrl);
  }

  //uses the url 'subjects.href' url returned from the call the fetchCategory to fetch all the subjects in that category
  fetchSubjects(url:string):Observable<any>{

    return this.http.get<SubjectObject>(url);
  }

  // fetches a paginated view of student list sorting the list by student's first name and last name all in ascending order 
  fetchStudentList(page:number, pageSize:number):Observable<StudentInfo>{

    return this.http.get<StudentInfo>(`${this.studenListUrl}?page=${page}&size=${pageSize}&sort=firstName,asc&sort=lastName,asc`)
    
    
  }

 
  // method that posts new created assessment to the server
  postAssessment(test:TestDTO):Observable<HttpResponse<number>>{

    return this.http.post<HttpStatusCode>(this.setTestUrl, test,{observe:'response'});


  }

  // post or associate instructional guide to a just posted assessment
  uploadInstructions(instruction: {instructions:[]}, id:number):Observable<any>{

    return this.http.patch(`${this.setTestUrl}?id=${id}`, instruction)


  }

  // set task's milestone to the current value
   setTaskMilestone(value:number):void{


    this.taskMilestone.next(value);
  }

  // Sets description about the task at hand
  taskDescription(name:string){

    this.task.next(name);
  }

 
  // This is used to reset task's milestone after each task completion
  resetMilestone(){
 this.taskMilestone.next(0);

 }

// sends notifications to the students
sendNotifications(notification:NotificationDTO):Observable<HttpResponse<void>>{

  return this.http.post<void>(this.notificationUrl, notification,{observe:'response'});
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

  // Student information returned by the hateos link
  export interface StudentInfo{

    _embedded:{

      students:Array<Student>

      },
      page:{
        size:number,
        totalElements:number,
        totalPages:number,
        number:number
    }
  } 
export interface Student{

  firstName:string,
  lastName:string,
  email:string,
  mobileNumber:string,
  accountCreationDate:string
}

 

