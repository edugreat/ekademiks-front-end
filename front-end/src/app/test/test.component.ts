import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import { Attempt, TestService } from './test.service';
import { Option, TestContent } from './test-interface';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, take } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';
import { InstructionDialogComponent } from './instruction-dialog.component';
import { ProgressBarMode } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService, User } from '../auth/auth.service';
import { ConfirmationDialogService } from '../confirmation-dialog.service';
import { ActivityService } from '../activity.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatTooltip } from '@angular/material/tooltip';
import { MatAnchor, MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { NgIf, NgClass, NgFor } from '@angular/common';
import { ProgressBarComponent } from '../shared/progress-bar/progress-bar.component';
import { TimerComponent } from './timer/timer.component';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { MathJaxDirective } from '../shared/math-jax.directive';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { MatPrefix, MatSuffix } from '@angular/material/form-field';
import { ConfirmationComponent } from '../shared/confirmation/confirmation.component';
import { OptionSortPipe } from '../option-sort.pipe';
import { BreakpointService } from '../breakpoint.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-test',
    templateUrl: './test.component.html',
    styleUrl: './test.component.css',
    standalone: true,
    imports: [MatTooltip, MatAnchor, MatIcon, NgIf, ProgressBarComponent, NgClass, TimerComponent, MatAccordion, NgFor, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MathJaxDirective, MatRadioGroup, FormsModule, MatRadioButton, MatButton, MatPrefix, MatSuffix, ConfirmationComponent, OptionSortPipe]
})
export class TestComponent implements OnInit, OnDestroy{



testContent: TestContent|undefined;

testInstructions:string[] = [];//instructional guides for the test


//paginated portion of the assessment questions
paginatedQuestions?:{number:number, problem:string, options:Option[]}[];
pageSize = 5;
totalPages = 0;
currentPage = 0;






//boolean flag assuming the student has read the instructions or not
hasReadInstructions = false;

//Entering duration animation for the instruction dialog
 enterAnimationDuration = '3000ms';
 //Closing duration animation for the instruction dialog
 exitAnimationDuration = '1500ms';

 //width of the instructions dialog box
 dialogWidth = '250px';

//The current time left before the time alloted to complete the test
testDuration = 0;

//the number of questions asked
totalQuestions = 0;

//the progress pace the student makes
progress = 0;

barMode: ProgressBarMode ='buffer';
//Changes the progress bar color to reflect the progress of the student. A color of primary indicates good progress
progressBarColor = '';
//Number of questions remaining before the students finishes
remaining = 0;


//flag that shows whether submission is user effected or system effected.
//when submission is made by the student, a confirmation is prompted for them to endorse or otherwise cancel the submission
//if submission is made by the system due to the duration been elapsed, no confirm is required from the student
_autoSubmit = false;

// Flag that indicates when assessment is about being submitted. It triggers disabling of selection radio buttons upon assessment submission
submitting = false;

//to be unsubscribed when the template is destroyed
questionSub:Subscription | undefined;

topic = ''; //the topic the student selected for assessment

subject = ''; //subject for which the test assessment is based
//options selected by the students
selectedOptions:any[] = [];


//boolean flag showing whether the user's screen is small
smallScreen = false;
testStarted: boolean = false; // boolean flag indicating whether the student has clicked on the start button to commence the test

 //if the student has submitted the test
 testSubmitted = false;

 //myRecentPerformanceSub$: Subscription | undefined; //subscription that subscribes to the performance observable to get notiied when student wishes to see their academic performance
 showMyPerformace = false; 

 submissionSub$:Subscription | undefined;

 private currentUser?:User;

 private currentUserSub?:Subscription;

//  get information about user's device
private userDevice = toSignal(this.breakpointService.breakpoint$);

  constructor(private testService:TestService,
    private activatedRoute:ActivatedRoute,
    
    private breakpointService:BreakpointService,
    public dialog: MatDialog,
    private successSnackBar:MatSnackBar,
    private router:Router,
    private authService:AuthService,
    private confirmService:ConfirmationDialogService,
    private activityService:ActivityService
  ){

    effect(() => {

      (this.userDevice && this.userDevice()) === breakpointService.XS ? this.dialogWidth = '250px' : this.dialogWidth = '500px';
    })
  }

  ngOnInit(): void {

   this.currentUserSub = this.authService.loggedInUserObs$.subscribe(user => this.currentUser = user);
   this.getQuestions();
  }

  ngOnDestroy(): void {
    
    this.questionSub?.unsubscribe();
    this.submissionSub$?.unsubscribe();
    this.currentUserSub?.unsubscribe();
    
  }

  //calls the getTest() of Test service to fetch all the questions for the given assessment
  getQuestions(){

  this.topic = this.activatedRoute.snapshot.params['topic'];
  this.subject = this.activatedRoute.snapshot.params['subject'];
  const category = this.activatedRoute.snapshot.params['category'];


  if(this.topic && category){

    // try accessing the ina-app cache for resource availability
    if(this.testService.getTestFor(this.topic.concat(category))){

     

      let testContent = this.testService.getTestFor(this.topic.concat(category));

      this.processAssessmentData(testContent!);

    } 
    // get resource from the server
    else{

     
      this.questionSub =  this.testService.getTest(this.topic, category).subscribe(testContent => {


        this.processAssessmentData(testContent);
    
    
    
       });
    }

  
  }
  
}

  private processAssessmentData(testContent: TestContent) {
    this.testContent = testContent; //set the returned test content to the testContent property




    //get the instructions for the test
    this.testInstructions = testContent.instructions;


    //selected options initialized to null
    this.selectedOptions = new Array(this.testContent.questions.length).fill(null);

    //sets the number of questions askd
    this.totalQuestions = this.testContent.questions.length;

    this.remaining = this.totalQuestions;

    //set the initial pagination information
    this.updatePaginationInfo(this.currentPage);

    //opens the dialog box once the question gets loaded
    this.openDialog(this.enterAnimationDuration, this.exitAnimationDuration);
  }

//set pagination information
private updatePaginationInfo(start:number){
const from = start * this.pageSize;
const to = from + this.pageSize;
if(to < this.totalQuestions){
  this.paginatedQuestions = this.testContent!.questions.slice(from, to).map((question) =>({
    number:question.number,
    problem:question.problem,
    options:question.options
  }));

}else{

  this.paginatedQuestions = this.testContent?.questions.slice(from).map((question) =>({
    number:question.number,
    problem:question.problem,
    options:question.options
  }))
}

this.totalPages = Math.ceil(this.totalQuestions/this.pageSize);

}

//handles user request for next page
nextPage(){

  

  if(this.currentPage < this.totalPages){
    this.currentPage++; //increment current page by 1 if it is less the total page viewable

    //updates the pagination information
    this.updatePaginationInfo(this.currentPage)
  }
}


//handles user request for previous page
previousPage(){

  if(this.currentPage > 0){

    this.currentPage--;
    this.updatePaginationInfo(this.currentPage);
  }
}


//triggers the commencement of test and the start of timer
startTest() {

  //display the dialog again if the student does not acknowledge 

  if(! this.hasReadInstructions){
    this.openDialog(this.enterAnimationDuration, this.exitAnimationDuration);
  }
  else 
  {
    //get the duration for the test converted to seconds
  this.testDuration = this.activatedRoute.snapshot.params['duration'] * 60;
  this.testStarted = true;
  
}
 
  
}

//submits the test assessment after the time elapses

submit() {

  if(!this._autoSubmit){ //if it is student's initiated submission

    this.confirmService.confirmAction('Are you sure to submit ?');
    this.confirmService.userConfirmationResponse$.pipe(take(1)).subscribe((response) =>{

      //user vetoes submission
      if(response){

        this.submitting = true; 


        const attempted = this.selectedOptions.some(option => option !== null);
  
        if(attempted){
          
         let attempt:Attempt = {
      
          testId:  Number(sessionStorage.getItem('testId')),
          studentId: this.currentUser ? this.currentUser.id : -1,
          selectedOptions: this.selectedOptions
         }
          
      
          //extracts this part of the test content for use later in the student performance feedback to give a tip to the student for the questions they answerred and their correct options
          const data:{problem:string, response:string, answer:string}[] = this.testContent!.questions.map((question, index) =>({
            problem:question.problem,
            response:question.options.filter((option) => this.selectedOptions[index] === option.letter).map(option => option.text)[0],
            answer: question.options.filter((option)=> option.letter === question.answer).map(option => option.text)[0]
          }))
      
          //persist to the session storage for later use
          sessionStorage.setItem("testTip", JSON.stringify(data));
      
         
      
          // if the user attempting to submit is a logged in user
        if(this.authService.isLoggedIn){
          
           //submit the student's performance to the back-end
        this.submissionSub$ =  this.testService.submitTest(attempt).subscribe({
          next:(response:{message:string}) =>{
            
            this.testSubmitted = true;//sets the 'testSubitted' boolean to true so as to deactivate the submit button, so that a resubmission  cannot initiated 
            this.openSnackBar(`${response.message} PLEASE WAIT...`);//open a snack bar to notify the student of successful submission
          },
      
            complete:() => {
              this.activityService.currentAction('submission')//notifies the 'canDeactivate' that navigation is intended after assessment submission has been performed 
              
              

              setTimeout(() => {
                
               // persist student's performance to server's cache
               this.saveRecentPerformance() ;
              }, 5000);
             
            },
           
            error:(error) =>{
             
            }
         })
        }else{//for guest students, do not submit to the backend, instead route to the performance page for them to see their recent performance or take more assessment
      
         
          this.openSnackBar('Submitted! PLEASE WAIT ...');
          this.testSubmitted = true;
          //notifies the 'canDeactivate' that navigation is intended after assessment submission has been performed 
          this.activityService.currentAction('submission');

         

          setTimeout(() => {
             // persist student's performance to server's cache
           this.saveRecentPerformance();
          }, 5000);
          
        }
      
        
        }
      
        
      }
    })

    
  }

  //system initiated submission
  else{

    this.submitting = true;
    const attempted = this.selectedOptions.some(option => option !== null);
  
    if(attempted){
      
     let attempt:Attempt = {
  
      testId:  Number(sessionStorage.getItem('testId')),
      studentId: this.currentUser ? this.currentUser.id : -1,
      selectedOptions: this.selectedOptions
     }
      
  
      //extracts this part of the test content for use in later in the student performance feedback to give a tip to the student for the questions they answers and their correct options
      const data:{problem:string, response:string, answer:string}[] = this.testContent!.questions.map((question, index) =>({
        problem:question.problem,
        response:question.options.filter((option) => this.selectedOptions[index] === option.letter).map(option => option.text)[0],
        answer: question.options.filter((option)=> option.letter === question.answer).map(option => option.text)[0]
      }))
  
      //persist to the session storage for later use
      sessionStorage.setItem("testTip", JSON.stringify(data));
  
     
    if(this.authService.isLoggedIn){
      
       //submit the student's performance to the back-end
    this.submissionSub$ =  this.testService.submitTest(attempt).subscribe({
      next:(response:{message:string}) =>{
        
        this.testSubmitted = true;//sets the 'testSubitted' boolean to true so as to deactivate the submit button, so that a resubmission  cannot initiated 
        this.openSnackBar(`${response.message} PLEASE WAIT...`);//open a snack bar to notify the student of successful submission
    
        
      },
  
        complete:() => {

          //notifies the 'canDeactivate' that navigation is intended after assessment submission has been performed 
         this.activityService.currentAction('submission');

         
         
          setTimeout(() => {
             // persist student's performance to server's cache
           this.saveRecentPerformance() ;
          }, 5000);
         
        },
       
        error:(err) =>{
          console.log(err.error)
        }
     })
    }else{//for guest students, do not submit to the backend, instead route to the performance page for them to see their recent performance or take more assessment
 
      this.openSnackBar('Submitted! PLEASE WAIT ...');
      this.testSubmitted = true;

      //notifies the 'canDeactivate' that navigation is intended after assessment submission has been performed 
      this.activityService.currentAction('submission');
      

      setTimeout(() => {
       // persist student's performance to server's cache
       this.saveRecentPerformance() ;
      }, 5001);
      
    }
  
    
    }

  }

  
  
  }

  //automatic submission is triggered once the assessment time is up
  autoSubmit(event:boolean){
if(event ===true){

  this._autoSubmit = true;

this.submit();//reuse the existing code 
}

  }

  //calculate the percentage progress of the student
  calculateProgress(){

    //get the number of attempts
    const attempted:any[] = this.selectedOptions.filter(option => option !== null);
   
    this.progress = Math.floor((attempted.length * 100)/this.totalQuestions);
    
    this.remaining = Number(Math.ceil(this.totalQuestions - attempted.length));
  
    this.progressBarColor = (this.progress >= 50) ? 'primary' : 'warn'; //checks if the student has attempted 50% questions or more,then changes color of the progress bar

  }



goBack() {
  window.history.back();
 
}

//The instruction says a student must attempt at leat five questions to be able to submit
public submitable(): boolean{
  let attempted = 0;
  //if questions have arrived
 if(this.selectedOptions.length){

 
  this.selectedOptions.filter(option =>{

   option !== null ? attempted++ : attempted;

  })

}

 return attempted >= 5 ? true : false

}

//Triggers the opening of  animated instruction dialog box
openDialog(enterAnimationDuration:string, exitAnimationDuration:string){

  //open the dialog box and pass the test instructions to it
 let dialogRef = this.dialog.open(InstructionDialogComponent, {
  width: this.dialogWidth,
  enterAnimationDuration,
  exitAnimationDuration,
  data:{instructions: this.testInstructions}
});

 dialogRef.afterClosed().subscribe(result =>{
  
  this.hasReadInstructions = result as boolean;
 })
}

private openSnackBar(message:string){
  this.successSnackBar.open(
   `${message}`, '', {
     duration: 5000, // 5 seconds
     verticalPosition: 'top', 
     horizontalPosition: 'center', 
     panelClass: ['success-snackbar']
   }
  )

 }



 //displays users's recent performance if the 'showMyPerformance' evaluates to true due to user's input selection
private saveRecentPerformance(){

 
//extract the correct options for the particular test
const correctOptions = this.testContent!.questions.map(question => question.answer);
//get the student's recent performance
const recentPerformance: PerformanceObject = {
 subjectName: this.subject,
 testTopic: this.topic,
 selectedOptions: this.selectedOptions,
 correctOptions:correctOptions
}

// retrieve key to be used in performance redis retrieval of cached value, empty string value for guest users
  const cachingKey = sessionStorage.getItem('cachingKey') ? sessionStorage.getItem('cachingKey') : '';

  // persist recent performance to server's cache
  this.testService.saveRecentPerformanceToCache(recentPerformance, cachingKey!).pipe(take(1)).subscribe({

    // persist the returned caching key to the browser storage. This is used to retrieved student's recent performance
    next:(key) =>{
      
    
      sessionStorage.setItem('cachingKey', key)


    },

    error:(err) => {
     
      console.log(err.error)
    },

    complete:() => {
     

     
      // route to the 'performance page' so they can see their recent performance
      this.router.navigate(['/performance']);


    }

  })


  

}
}

//an interface that captures the information we need to display in student's performance view component
export interface PerformanceObject{

  subjectName:string,
  testTopic:string,
  selectedOptions:string[],
  correctOptions:string[]
}
