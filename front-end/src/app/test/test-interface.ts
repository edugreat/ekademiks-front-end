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

//object of test content received returned from ther server
export interface TestContentDTO{
    questions:QuestionDTO[],
    instructions:string[]


}

// a data transfer object for easy communication between the backend and front end
export interface QuestionDTO{
    questionNumber:number,
    text:string,
    answer:string,
    options:Option[]
    }

    
//Portion of the Question DTO without the instructions
export interface QuestionPart{
    number:number,
    problem:string,
    answer:string,
    options:Option[]
  
  }
