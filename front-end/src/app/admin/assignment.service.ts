import { Injectable } from '@angular/core';
import { Endpoints } from '../end-point';
import { HttpClient, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { Observable, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {

 

  constructor(private endpoints:Endpoints, private http:HttpClient) { }


  public postAssignment(details:AssignmentDetails):Observable<HttpResponse<number>>{

    return this.http.post<HttpResponse<number>>(this.endpoints.assignment, details,{
      observe:'body'
    } )
  }


}


export interface AssignmentDetails{

  id?:number,
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
  assignmentDTO:Array<AssignmentDTO>

}

interface AssignmentDTO{

  id?:number,
  _index:number,
  problem:string,
  answer:string,
  
}