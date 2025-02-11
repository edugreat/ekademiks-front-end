import { Injectable } from '@angular/core';
import { Endpoints } from '../end-point';
import { HttpClient, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { Observable, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class  AssignmentService {

 

  constructor(private endpoints:Endpoints, private http:HttpClient) { }


  public postAssignment(details:AssignmentDetails):Observable<HttpResponse<number>>{

    return this.http.post<HttpResponse<number>>(this.endpoints.assignment, details,{
      observe:'body'
    } )
  }

  public postPDFAssignment(formData:FormData):Observable<number>{

   
   
    return this.http.post<number>(this.endpoints.pdfAssignmentUrl, formData)
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
  assignmentResourceDTO?:Array<assignmentResourceDTO>,
  pdfFiles?:File[]

}

interface assignmentResourceDTO{

  id?:number,
  _index:number,
  problem:string,
  answer:string,
  
}