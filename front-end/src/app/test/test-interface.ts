/*
An interface containing both the Questions and Instructions for the questions, to be returned to the components that needs it
*/
export interface TestContent{

   questions:QuestionPart[],
   instructions:string[]
}

export interface Option {

    text:string,
    letter:'A'|'B'|'C'|'D'|'E'


}

//object of test content returned from ther server
export interface TestContentDTO{
    testId:number,
    questions:QuestionDTO[],
    instructions:string[]


}

// a data transfer object for easy communication between the backend and front end
export interface QuestionDTO{
    questionNumber:number,//numeric value
    text:string,//text representing the problem to attempt
    answer:string,//one character string value 'A-E' showing the correct option
    options:Option[]//option interface
    }

    
//Question received from the backend displayable on the front-end. The only change is in the field name where dto's 'questionNumber' is mapped to 'number' field name
export interface QuestionPart{
    number:number,//numeric value
    problem:string,//text representing the problem to attempt
    answer:string,//one character string value 'A-E' showing the correct option
    options:Option[]//option interface
  
  }
