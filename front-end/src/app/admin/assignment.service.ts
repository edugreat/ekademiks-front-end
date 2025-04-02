import { Injectable } from '@angular/core';
import { Endpoints } from '../end-point';
import { HttpClient, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { Observable, Subject, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class  AssignmentService {

  // subject that emits ID of any assignment the student has view.
  // The notification-details component uses this emitted ID to clear out the assignment from notification view
 private assignmentMarkedAsReadSub =  new Subject<number>();

 public assignmentMarkedAsRead$ = this.assignmentMarkedAsReadSub.asObservable();

  constructor(private endpoints:Endpoints, private http:HttpClient) { }


  public postAssignment(details:AssignmentDetails):Observable<HttpResponse<number>>{

    return this.http.post<HttpResponse<number>>(this.endpoints.assignmentUrl, details,{
      observe:'body'
    } )
  }


  // returns details  regarding a particular assignment the student wishe to attempt
  public getAssignmentDetails(detailsId:number):Observable<AssignmentDetails>{

    return this.http.get<AssignmentDetails>(`${this.endpoints.assignmentDetailsUrl}?id=${detailsId}`)


  }

  public getAssignmentResources(assignmentId:string):Observable<AssignmentResourceDTO[]>{
    
    return this.http.get<AssignmentResourceDTO[]>(`${this.endpoints.assignmentResourcesUrl}?assId=${assignmentId}`)
  
  }
  public postPDFAssignment(formData:FormData):Observable<number>{

   
   
    return this.http.post<number>(this.endpoints.pdfAssignmentUrl, formData)
  }

  markAssignmentAsRead(assignmentId: number){

    this.assignmentMarkedAsReadSub.next(assignmentId);
  }

}


export interface AssignmentDetails{
 
  id?:number|null,
  name:string,
  type:string,
  admin:number,
  subject:string,
  category:string,
  institution:number,
  allocatedMark:number,
  totalQuestions:number
  creationDate:Date,
  submissionEnds:Date
  assignmentResourceDTO?:Array<AssignmentResourceDTO>,
  pdfFiles?:File[]

}

interface AssignmentResourceDTO{

  id?:number,
  type:string,
  _index?:number,
  problem:string,
  options?:string[]
  answer:string,
  
}