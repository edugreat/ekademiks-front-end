import { Component, OnDestroy, OnInit } from '@angular/core';
import { AdminService } from '../../admin.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-assessment-questions',
  templateUrl: './assessment-questions.component.html',
  styleUrl: './assessment-questions.component.css'
})

// Component that serves assessment test for a given test id
export class AssessmentQuestionsComponent implements OnInit, OnDestroy{

  
  sub?:Subscription;

  // an array of questions received from the server
  private questions:Question[] = [];

  // for pagination capability
  paginatedQuestions?:Question[];


  // Information about the topic for the assessment(e.g Calculus etc)
  assessmentTopic:string | null = '';

  currentIndex = 0;
  totalQuestions = 0;
  // represents the number of
  DEFAULT_PAGE_SIZE = 5;
  



  constructor(private adminService:AdminService, private activatedRoute:ActivatedRoute){}
  
  
  ngOnInit(): void {
   
    this.activatedRoute.paramMap.subscribe(params => {

      const testId = params.get('testId');
      this.assessmentTopic = params.get('topic');
      if(testId){

        this.fetchQuestions(Number(testId));
      }
    })
  }
  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
  }


  private fetchQuestions(testId:number){

    this.sub = this.adminService.fetchQuestionsForTestId(testId).subscribe({

      next:(data) =>{

        this.questions = data._embedded.questions.map((question: { id: any; questionNumber: any; text: any; answer: any; options: any; }) => ({

          id:question.id,
          questionNumber:question.questionNumber,
          question:question.text,
          answer:question.answer,
          options:question.options
        }))
      },

      complete:() =>  {
        this.totalQuestions = this.questions.length;
        this.setPagination();
      }
      
    })


  }

  // setPagination ensures five questions per page or less when the 
  //number of remaining questions is less than five
  private setPagination(){

    this.paginatedQuestions = ((this.currentIndex + this.DEFAULT_PAGE_SIZE) <= this.totalQuestions) ? (this.questions.slice(this.currentIndex, this.DEFAULT_PAGE_SIZE)) : this.questions.slice(this.currentIndex);
  // set current page to a value = highest index of paginated questions
  this.currentIndex += this.DEFAULT_PAGE_SIZE - 1;

   
  }

  nextPage(){

    // Increment current index by one as we intend to move to the next page
    this.currentIndex++;
    this.setPagination();
  }

  previousPage(){

    // Decrement current index by the DEFAULT_PAGE_SIZE as as to exclude values in excess of DEFAULT_PAGE_SIZE
    this.currentIndex = this.paginatedQuestions!.length - this.DEFAULT_PAGE_SIZE;
    this.paginatedQuestions?.splice(this.currentIndex)

  }
  


  editQuestion(arg0: any) {
    throw new Error('Method not implemented.');
    }
    deleteQuestion(arg0: any) {
    throw new Error('Method not implemented.');
    }
    
}

// an object representing the Question for a given test
type Question = {

  id:string,
  questionNumber:number,
  question:string,
  answer:string,
  options:Array<{text:string,letter:string}>
}
