import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AssessmentsService {

  baseUrl = `http://localhost:8080/learning/levels`;
  subjectNameUrl = `http://localhost:8080/tests/level`;
  topicUrl = `http://localhost:8080/tests`

  constructor(private http:HttpClient) { }


  public getAssessmentLevels():Observable<Levels[]>{

    return this.http.get<levelDTO>(`${this.baseUrl}`).pipe(

    map(dtos => this.convertToLevel(dtos)))

  

  }

  //fetches subject names for the given level argument
  public fetchSubjectNames(level:string):Observable<string[]>{
    
    return this.http.get<[]>(`${this.subjectNameUrl}?level=${level}`);
  }

  //convert level object received from the server to a Level object
  private convertToLevel(dto:levelDTO):Levels[]{

    return dto._embedded.levels.map(level =>({

      category:level.category
    }))
  }

  //fetches from the server test topics for the given subject and category
  getTopics(subjectName:string, category:string):Observable<string[]>{

    return this.http.get<string[]>(`${this.topicUrl}?subject=${subjectName}&category=${category}`);
  }
}


//data transfer object for the level object of the backend server
export interface levelDTO{
  _embedded:{
    levels: Array<{
      category:string
    }>
  }


  
}

export interface Levels{
category:string

}





