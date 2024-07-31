import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private setTestUrl = 'http://localhost:8080/admins/test';

  private levelUrl = 'http://localhost:8080/learning/levels'; //HATEOAS LINK

  

  constructor(private http:HttpClient) { }

  //Fetches from the database, all the assessment categories
  fetchCategory():Observable<any>{

    return this.http.get<CategoryObject>(this.levelUrl);
  }

  //uses the url 'subjects.href' url returned from the call the fetchCategory to fetch all the subjects in that category
  fetchSubjects(url:string):Observable<any>{

    return this.http.get<SubjectObject>(url);
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


