import { HttpClient, HttpResponse, HttpStatusCode} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { TestDTO } from './upload/upload-test.component';
import { NotificationDTO } from './upload/notifications/notifications.component';
import { Endpoints } from '../end-point';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
 
  // Observable that emits the number of tasks completed
  // This is itended to use in a mat-stepper to indicate progress on tasks such as assessment upload, result uploads tasks etc
  private taskMilestone = new BehaviorSubject<number>(0);

   taskMilestoneObs$ = this.taskMilestone.asObservable();

  
  // Emits the name of task at hand
  private task = new BehaviorSubject<string>('');

  taskObs$ = this.task.asObservable();



  

  constructor(private http:HttpClient, private endpoints:Endpoints) { }

  //Fetches from the database, all the assessment categories
  fetchCategories():Observable<any>{

    return this.http.get<CategoryObject>(this.endpoints.levelUrl);
  }

  //uses the url 'subjects.href' url returned from the call the fetchCategory to fetch all the subjects in that category
  fetchSubjects(url:string):Observable<any>{

    return this.http.get<SubjectObject>(url);
  }

  // fetches a paginated view of student list sorting the list by student's first name and last name all in ascending order 
  fetchStudentList(page:number, pageSize:number):Observable<StudentInfo>{

    return this.http.get<StudentInfo>(`${this.endpoints.studenListUrl}?page=${page}&size=${pageSize}&sort=firstName,asc&sort=lastName,asc`)
    
    
  }

 
  // method that posts new created assessment to the server
  postAssessment(test:TestDTO):Observable<HttpResponse<number>>{

    return this.http.post<HttpStatusCode>(this.endpoints.setTestUrl, test,{observe:'response'});


  }

  // post or associate instructional guide to a just posted assessment
  uploadInstructions(instruction: {instructions:[]}, id:number):Observable<any>{

    return this.http.patch(`${this.endpoints.setTestUrl}?id=${id}`, instruction)


  }

  // Service for disabling student's account
  disableStudentAccount(studentId:number):Observable<HttpResponse<number>>{

    return this.http.patch<HttpStatusCode>(`${this.endpoints.baseUrl}/admins/disable`, {'studentId':studentId},{observe:'response'});

  }


  // Enables student's account
  enableStudentAccount(studentId: number):Observable<HttpResponse<number>> {

    return this.http.patch<HttpStatusCode>(`${this.endpoints.baseUrl}/admins/enable`, {"studentId": studentId}, {observe:'response'})
   
  }

// fetches student's assessment performance information for the student with the given student id
fetchStudentPerformanceInfo(studentId:number):Observable<StudentPerformanceInfo>{

  return this.http.get<StudentPerformanceInfo>(`${this.endpoints.studenListUrl}/${studentId}/studentTests`)

}

// fetches the names of an assessment using the given studentTest id
fetchAssessmentNames(studentTestId:number):Observable<any>{

  return this.http.get<any>(`${this.endpoints.studentTestsUrl}/${studentTestId}/test`).pipe(
    map((result) => {

      return {testName:result.testName}
    })
  )
  
}


// feches all assessment topics for the given assessment level and subject name
public fetchAssessmentInfo(categoryId:number):Observable<AssessmentInfo>{

  return this.http.get<AssessmentInfo>(`${this.endpoints.levelUrl}/${categoryId}/subjects`)
}

// fetches all assessment categories from the server
public fetchAssessmentCategories(page?:number, pageSize?:number):Observable<AssessmentCategory>{

  if(page && pageSize) return this.http.get<AssessmentCategory>(`${this.endpoints.levelUrl}?page=${page}&size=${pageSize}&sort=firstName,asc&sort=lastName,asc`);

  return this.http.get<AssessmentCategory>(`${this.endpoints.levelUrl}?sort=category,asc`);
}

// method that fetches all the questions for the given test id
public fetchQuestionsForTestId(testId:number):Observable<any>{

  return this.http.get<any>(`${this.endpoints.assessmentQuestionsBaseUrl}/${testId}/questions`)
}

public deleteStudent(studentId:number):Observable<HttpResponse<number>>{

  

  return this.http.delete<HttpStatusCode>(`${this.endpoints.deleteUrl}?studentId=${studentId}`,{observe:'response'});
}

updateQuestions(questions:any, testId:number):Observable<HttpResponse<number>>{


  return this.http.put<HttpStatusCode>(`${this.endpoints.updateQuestionUrl}?testId=${testId}`, questions, {observe:'response'})
}


modifyAssessment(modifying:{topic:string, duration:number}, assessmentId:number):Observable<HttpResponse<number>>{
  
  return this.http.patch<HttpStatusCode>(`${this.endpoints.updateAssessmentUrl}?assessmentId=${assessmentId}`, modifying, {observe:'response'});
}

 deleteQuestion(testId:number, questionId:number):Observable<HttpResponse<number>>{


  return this.http.delete<HttpStatusCode>(`${this.endpoints.deleteQuestionUrl}?testId=${testId}&questionId=${questionId}`,{observe:'response'});
 }


 deleteAssessment(testId: number):Observable<HttpResponse<number>> {

  return this.http.delete<HttpStatusCode>(`${this.endpoints.deleteAssessmentUrl}?testId=${testId}`, {observe:"response"})
  
}

// calls the server endpoint to return all assessment topics for editing or deletion purpose
assessmentTopics():Observable<{[key:string]:Array<string>}>{

  return this.http.get<{[key:string]:Array<string>}>(`${this.endpoints.assessmentTopicsUrl}`);
}

// service that calls the server endpoint to update an assessment topic. 
// object passed to the method is a key-value object where the key is the oldValue used to uniquely retrieve the assessment topic from the database, and the value is new value used to update the topic
updateAssessementTopic(keyValueObj: any, category: string):Observable<HttpResponse<number>> {

 
  
  return this.http.patch<HttpStatusCode>(`${this.endpoints.editTopicUrl}?category=${category}`, keyValueObj,{observe:'response'})
}


deleteAssessmentTopic(category: string, topic: string):Observable<HttpResponse<number>> {

  return this.http.delete<HttpStatusCode>(`${this.endpoints.assessmentDeletionUrl}?category=${category}&topic=${topic}`,{observe:'response'})
  
}

// service that calls the server endpoint to retrieve all assessment subject names in a key-value object,
// where key is the category assessment belongs to and value is a list of subject names under the category
assessmentSubjects():Observable<{[key:string]:Array<string>}> {

  return this.http.get<{[key:string]:Array<string>}>(`${this.endpoints.assessmentSubjectsUrl}`)
 
}

// calls the server api passing a key-value object, where key is the assessment category and value is the subject name used to update old name
updateSubjectName(editedObject: { [key: string]: string; }, oldSubjectName:string):Observable<HttpResponse<number>> {
  
  return this.http.patch<HttpStatusCode>(`${this.endpoints.updateSubjectNameUrl}?oldName=${oldSubjectName}`,editedObject, {observe:'response'})
}

// calls the server endpoint passing values(category and subjectName) to delete the given subject name
deleteSubject(category:string, subjectName:string):Observable<HttpResponse<number>> {
  

  return this.http.delete<HttpStatusCode>(`${this.endpoints.deleteSubjectUrl}?category=${category}&subjectName=${subjectName}`, {observe:'response'});
}

// communicates to the backend to update name of the category rreferenced by 'previousName' with 'currentName'
updateCategoryName(currentName:string, previousName: string):Observable<HttpResponse<number>> {
  
  return this.http.patch<HttpStatusCode>(`${this.endpoints.updateCategoryNameUrl}?previousName=${previousName}`, currentName, {observe:'response'});


}

// communicates to the server to delete the assessment category referenced by 'category'
deleteCategory(category: number):Observable<HttpResponse<number>> {
  
  return this.http.delete<HttpStatusCode>(`${this.endpoints.deleteCategoryUrl}?category=${category}`, {observe:'response'})

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

  return this.http.post<void>(this.endpoints.notificationUrl, notification,{observe:'response'});
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

  id:number,
  firstName:string,
  lastName:string,
  email:string,
  mobileNumber:string,
  accountCreationDate:string,
  accountEnabled:boolean,
  lockedAccount:boolean
}

// An interface representing student's performance information on assessments they had taken
export interface StudentPerformanceInfo{

  _embedded:{

    StudentTests:Array<StudentPerformance>
  }


}

// An interface representing students performance in an assessment
export interface StudentPerformance{
  id:number,
  score:number,
  grade:string,
  when:string
}

// An interface representing a basic assessment information for a given assessment level and subject
export interface AssessmentInfo{

  _embedded:{

    subjects:Array<{id:number, subjectName:string, test:Array<{id:number, testName:string, duration:number}>}>
  }
}

// An interface representing assessment category received form the server (such as SENIOR AND JUNIOR)
export interface AssessmentCategory{

  _embedded:{
    levels:Array<{id:number, category:string}>
  },
  page:{
    size:number,
    totalElements:number,
    totalPages:number,
    number:number
  }
}

