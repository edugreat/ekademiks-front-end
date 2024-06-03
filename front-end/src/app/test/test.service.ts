import { Injectable } from '@angular/core';
import { Option, Question } from './test-interface';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TestService {

  baseUrl = 'http://localhost:8080/tests/start'

  constructor(private http:HttpClient) { }



getTest(topic:string, category:string):Observable<Question[]>{

  return this.http.get<QuestionDTO[]>(`${this.baseUrl}?topic=${topic}&category=${category}`).pipe(
    map(dtos => dtos.map(dto =>  {
      return this.convertToQuestion(dto)
    }))
  )
}

//helper method to transform the Question dto object fetched from the server side to the question object to display on th front end
  private convertToQuestion(dto:QuestionDTO):Question{

    return {
      number:dto.questionNumber,
      text:dto.text,
      options:dto.options
    }
    
  }

}
// a data transfer object for easy communication between the backend and front end
export interface QuestionDTO{
  questionNumber:number,
  text:string,
  answer:string,
  options:Option[]
}
