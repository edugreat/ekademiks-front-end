import { Injectable } from '@angular/core';
import { Option, Question } from './test-interface';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TestService {

  baseUrl = 'http://localhost:8080/tests/1'

  constructor(private http:HttpClient) { }



getTest():Observable<Question[]>{

  return this.http.get<{questions:QuestionDTO[]}>(this.baseUrl).pipe(
    map(dtos => dtos.questions.map(dto =>  {
      return this.convertToQuestion(dto)
    }))
  )
}

//helper method to transform the Question dto object fetched from the server side to the question object to display on th front end
  private convertToQuestion(dto:QuestionDTO):Question{

    return {
      number:dto.questionNumber,
      text:dto.text,
      answer:dto.answer,
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
