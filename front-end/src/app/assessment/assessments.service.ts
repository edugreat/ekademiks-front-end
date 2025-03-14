import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, asyncScheduler, map, of, scheduled, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AssessmentsService {

  baseUrl = `http://localhost:8080/learning/levels`;
  subjectNameUrl = `http://localhost:8080/tests/level`;
  testUrl = `http://localhost:8080/tests`;

  // a map of which key is the academic level the given subject belongs. This is mean to provide cache to prevent excessive server interaction when users switch between subjects
  private _subjectMap = new Map<string, string[]>();

  private _assessmentLevels?:Observable<Levels[]>;

  // caches the assessment topic and its duration, for the assessment the user selected
  private _topicsAndDurationsMap = new Map<string, Observable<TopicAndDuration[]>>();

  // in-app cache for a particular assessment's topic and duration
  private _topicAndDurationMap = new Map<number, Observable<TopicAndDuration>>();

  constructor(private http:HttpClient) { }


  public getAssessmentLevels():Observable<Levels[]>{

    return this.http.get<levelDTO>(`${this.baseUrl}`).pipe(

    map(dtos => this.convertToLevel(dtos)))

  

  }

  public set assessmentLevels(levels: Observable<Levels[]>){

    this._assessmentLevels =  levels;

  }


  public get assessmentLevels(): Observable<Levels[]>|undefined {

    return this._assessmentLevels
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

  public subjects(category:string, subjects:string[]){

    this._subjectMap.set(category, subjects);
  }

  public getSubjects(category:string){

    return this._subjectMap.get(category)
  }

  public setTopicsAndDurations(category:string, data:Observable<TopicAndDuration[]>){

    this._topicsAndDurationsMap.set(category,data);
  }

  public getSelectedTopicsAndDurations(category:string){

    return this._topicsAndDurationsMap.get(category)!
  }

  //fetches from the server test topics and durations for the given subject and category
  getTopicsAndDurations(subjectName:string, category:string, studentId:number):Observable<TopicAndDuration[]>{


    return this.http.get<Array<{testName:string, duration:number}>>(`${this.testUrl}?subject=${subjectName}&category=${category}`, {
      headers:{
        'studentId':`${studentId}`
      }
    }).pipe(
      map((results) => results.map(result =>{

        return {topic:result.testName, duration:result.duration}
      }))
    );
  }

  // fetches from the server test topic and category for a given test id
  getTopicAndDuration(testId:number):Observable<TopicAndDuration>{

    return this.http.get<TopicAndDuration>(`${this.testUrl}/info?testId=${testId}`).pipe(
      tap((data) => this.setTopicAndDuration(testId, of(data)))
    )
  }

  // make in-app cache of assessment's topic and duration
  private setTopicAndDuration(testId:number, data:Observable<TopicAndDuration>){

    this._topicAndDurationMap.set(testId, data);
  }


  public getSelectedTopicAndDuration(testId:number):Observable<TopicAndDuration>{

    return this._topicAndDurationMap.get(testId)!;
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

//models the server side Level object
export interface Levels{
category:string

}

//models the returned server side topicAndDuration object
export interface TopicAndDuration{
topic:string,
duration:number

}







