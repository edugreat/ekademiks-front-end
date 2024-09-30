import { Component, OnDestroy, OnInit } from '@angular/core';
import { AdminService } from '../../admin.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MediaService } from '../../../media-service';
import { MediaChange } from '@angular/flex-layout';
import { HttpResponse, HttpStatusCode } from '@angular/common/http';

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


  // question to be edited. The value is assigned from the view component once the user clicked 'edit button' for a given question
  editableQuestion?:Question;

  // subscription for the current device media accessing this page
  private mediaSub?:Subscription;
  
  // used to change the header tag based on screen sizes
  smallScreenDevice = false;

  // shows the current question number to edit
  currentQuestionNumber?:number;

  // an array of updated questions to be sent to the server for persistence
  private updateQuestions:Question[] = [];


  constructor(private adminService:AdminService, private activatedRoute:ActivatedRoute, private mediaService:MediaService,

    private router:Router
  ){}
  
  
  ngOnInit(): void {
   
    this.activatedRoute.paramMap.subscribe(params => {

      const testId = params.get('testId');
      this.assessmentTopic = params.get('topic');
      if(testId){

        this.currentIndex = 0;
        this.totalQuestions = 0;
        this.DEFAULT_PAGE_SIZE = 5;
        this.fetchQuestions(Number(testId));
      };

      this.userDevice();
    });

  
  }
  ngOnDestroy(): void {
    this.mediaSub?.unsubscribe();
  }


  private fetchQuestions(testId:number){

    this.sub = this.adminService.fetchQuestionsForTestId(testId).subscribe({

      next:(data) =>{

        this.questions = data._embedded.questions.map((question: { id: any; questionNumber: any; question: any; answer: any; options: any; }) => ({

          id:question.id,
          questionNumber:question.questionNumber,
          question:question.question,
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

    const endIndex = this.currentIndex+this.DEFAULT_PAGE_SIZE;
    this.paginatedQuestions = ((this.currentIndex + this.DEFAULT_PAGE_SIZE) <= this.totalQuestions) ? (this.questions.slice(this.currentIndex, endIndex)) : this.questions.slice(this.currentIndex);
  // set current page to a value = highest index of paginated questions
  this.currentIndex += this.DEFAULT_PAGE_SIZE;

   
  }

  nextPage(){

   
    this.setPagination();
  }

  previousPage(){
const endIndex = this.currentIndex - this.DEFAULT_PAGE_SIZE;
// start index must be greater than or equal to zero
const startIndex = (endIndex - this.DEFAULT_PAGE_SIZE) > 0 ? (endIndex - this.DEFAULT_PAGE_SIZE) : 0;

this.paginatedQuestions = this.questions.slice(startIndex, endIndex);
this.currentIndex = endIndex;
  }
  


  editQuestion(id:number) {

    
  const question = this.paginatedQuestions!.filter(q => q.id === id)[0];
    this.editableQuestion = question;
    this.currentQuestionNumber = question.questionNumber;

    
   

    }
    deleteQuestion(arg0: any) {
    
    }


    // save update changes
    saveChanges() {

     if(this.editableQuestion){
      this.updateQuestions.push(this.editableQuestion);

     }
      
      this.editableQuestion = undefined; 

      const testId = this.activatedRoute.snapshot.paramMap.get('testId');
     
      if(testId){

        this.adminService.updateQuestions(this.updateQuestions, Number(testId)).subscribe({

          next:(value:HttpResponse<number>) => {

          
            
          },

          error:(err) => {

            console.log(err);
            this.router.navigate(['/error', err.error])

            
          },

          complete:() => this.updateQuestions = [] //resets this array after successfully persisting to the database
        })
      
      }


   
      
      }

      // gets information about user's screen device size.
      // This is used to change the header tag depending on the screen size
      private userDevice(){

        this.mediaSub = this.mediaService.mediaChanges().subscribe((changes:MediaChange[]) => {

      this.smallScreenDevice = changes.some(change => change.mqAlias === 'sm' || change.mqAlias === 'xs')
        })


      }
    
}

// an object representing the Question for a given test
type Question = {

  id:number,
  questionNumber:number,
  question:string,
  answer:string,
  options:Array<{text:string,letter:string}>
}



