import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { AdminService } from '../../admin.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, take } from 'rxjs';

import { HttpResponse } from '@angular/common/http';
import { ConfirmationDialogService } from '../../../confirmation-dialog.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { NgIf, NgFor } from '@angular/common';
import { MathJaxDirective } from '../../../shared/math-jax.directive';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-assessment-questions',
    templateUrl: './assessment-questions.component.html',
    styleUrl: './assessment-questions.component.css',
    standalone: true,
    imports: [NgIf, NgFor, MathJaxDirective, FormsModule]
})

// Component that serves assessment test for a given test id
export class AssessmentQuestionsComponent implements OnInit, OnDestroy, AfterViewInit{





  
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


  constructor(private adminService:AdminService, private activatedRoute:ActivatedRoute,

    private router:Router, private confirmationService:ConfirmationDialogService,
   // private breakpointObserver:BreakpointObserver
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

    });

  
  }

  ngAfterViewInit(): void {
   // this.userDevice();
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

    cancelEdit() {
      
      this.editableQuestion = undefined;
      }

    // deletes from the assessment, the question whose question number is given.
    deleteQuestion(questionNumber:number, questionId:number) {

      this.confirmationService.confirmAction(`Delete number ${questionNumber} ?`);

      this.confirmationService.userConfirmationResponse$.pipe(take(1)).subscribe(approved =>{

        if(approved){
       // Remove the question from the paginated questions array
      this.paginatedQuestions?.splice(this.paginatedQuestions.findIndex(q => q.questionNumber === questionNumber), 1);

      const testId = this.activatedRoute.snapshot.paramMap.get('testId');

      this.adminService.deleteQuestion(Number(testId), questionId).subscribe({

        error:(err) => this.router.navigate(['/error', err.error])
      })
  
        }
      })
      
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


      // the 'looks good' button in the viewpage indicates the user is okay with question list, hence desires to route back to the previous page
      looksGood() {

        window.history.back()
       
        }

      // gets information about user's screen device size.
      // This is used to change the header tag depending on the screen size
      // private userDevice(){


      //   this.mediaSub = this.breakpointObserver.observe([
      //     Breakpoints.Small,
      //     Breakpoints.XSmall
      //   ]).subscribe(result => {

      //     this.smallScreenDevice = result.matches;
      //     const el1 = document.getElementById('parent');
      // const el2 = document.getElementById('container');
      //  if(!this.smallScreenDevice && el1 && el2){

      //     el1.classList.remove('flex-start');
      //     el2.classList.add('auto-aligned')
        
      //  }else if(this.smallScreenDevice && el1 && el2){

      //   el1.classList.add('flex-start');
      //   el2.classList.remove('auto-aligned');
      //   el2.classList.add('right-padding');
      //  }

      //   })

      

      // }
    
}

// an object representing the Question for a given test
type Question = {

  id:number,
  questionNumber:number,
  question:string,
  answer:string,
  options:Array<{text:string,letter:string}>
}



