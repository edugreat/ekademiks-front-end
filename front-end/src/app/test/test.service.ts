import { Injectable } from '@angular/core';
import { QuestionDTO, QuestionPart, TestContent, TestContentDTO } from './test-interface';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TestService {

  //routes to the backend server to fetch test based on the request parameters
 baseTestUrl = 'http://localhost:8080/tests/start';

  constructor(private http:HttpClient) { }



getTest(topic:string, category:string):Observable<TestContent>{

  return this.http.get<TestContentDTO>(`${this.baseTestUrl}?topic=${topic}&category=${category}`).pipe(
    map(dto => this.convertToTestContent(dto))
  )
}

//helper method to transform the Question dto object fetched from the server side to the question object to display on th front end

private convertToQuestionPart(dto: QuestionDTO): QuestionPart {
  return {
    number: dto.questionNumber,
    problem: dto.text,
    answer: dto.answer,
    options: dto.options
  };
}



private convertToTestContent(dto: TestContentDTO): TestContent {
  return {
    questions: dto.questions.map(this.convertToQuestionPart),
    instructions: dto.instructions
  };
}

}


