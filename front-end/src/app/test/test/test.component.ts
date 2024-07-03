import { Component, OnDestroy, OnInit } from '@angular/core';
import { Attempt, TestService } from '../test.service';
import { TestContent } from '../test-interface';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MediaService } from '../../media-service';
import { MediaChange } from '@angular/flex-layout';
import { MatDialog } from '@angular/material/dialog';
import { InstructionDialogComponent } from '../instruction-dialog/instruction-dialog.component';
import { ProgressBarMode } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrl: './test.component.css'
})
export class TestComponent implements OnInit, OnDestroy{



testContent: TestContent|undefined;

testInstructions:string[] = [];//instructional guides for the test


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
val='';
 performanceSub$: Subscription | undefined; //subscription that subscribes to the performance observable to get notiied when student wishes to see their academic performance

 showMyPerformace = false; 

 submissionSub$:Subscription | undefined;

  constructor(private testService:TestService,
    private activatedRoute:ActivatedRoute,
    private mediaService:MediaService,
    public dialog: MatDialog,
    private successSnackBar:MatSnackBar,
    private router:Router
  ){}

  ngOnInit(): void {
   this.getQuestions();
   this.mediaAlias();
   console.log(this.val)
  }

  ngOnDestroy(): void {
    
    this.questionSub?.unsubscribe();
    this.submissionSub$?.unsubscribe();
  }

  //calls the getTest() of Test service to fetch all the questions for the given assessment
  getQuestions(){

  this.topic = this.activatedRoute.snapshot.params['topic'];
  this.subject = this.activatedRoute.snapshot.params['subject'];
  const category = this.activatedRoute.snapshot.params['category'];


  if(this.topic && category){

   this.questionSub =  this.testService.getTest(this.topic, category).subscribe(testContent => {


    this.testContent = testContent;//set the returned test content to the testContent property

    //get the instructions for the test
    this.testInstructions = testContent.instructions;


    //selected options initialized to null
    this.selectedOptions = new Array(this.testContent.questions.length).fill(null);

    //sets the number of questions askd
     this.totalQuestions = this.testContent.questions.length;

     this.remaining = this.totalQuestions;
    //opens the dialog box once the question gets loaded
    this.openDialog(this.enterAnimationDuration, this.exitAnimationDuration);



   });
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

  
  const attempted = this.selectedOptions.some(option => option !== null);
  
  if(attempted){
    
   let attempt:Attempt = {

    testId:  Number(sessionStorage.getItem('testId')),
    studentId: Number(sessionStorage.getItem('studentId')),
    selectedOptions: this.selectedOptions
   }
    
  

   //submit the student's performance to the back-end
  this.submissionSub$ =  this.testService.submitTest(attempt).subscribe({
    next:(value:string) =>{
      
      console.log('submitting!')
      this.testSubmitted = true;//sets the 'testSubitted' boolean to true so as to deactivate the submit button, so that a resubmission is not initiated 
      this.openSnackBar(value);//open a snack bar to notify the student of successful submission
    },

      complete:() => {
        console.log('submitted')
        setTimeout(() => {
          this.router.navigate(['/performance'])
        }, 5000);
      },
     
      error:() =>{
        console.log()
      }
   })
  }

 

  }

  //automatic submission is triggered once the assessment time is up
  autoSubmit(event:boolean){
if(event ===true){


  
  const attempted = this.selectedOptions.some(option => option !== null);
  if(attempted){
   let attempt:Attempt = {

    testId:  Number(sessionStorage.getItem('testId')),
    studentId: Number(sessionStorage.getItem('studentId')),
    selectedOptions: this.selectedOptions
   }
    

   //submit the student's performance to the back-end
   this.submissionSub$ = this.testService.submitTest(attempt).subscribe(({
    next:(value) =>{
      this.testSubmitted = true;//sets the 'testSubitted' boolean to true so as to deactivate the submit button, so that a resubmission is not initiated 
      this.openSnackBar(value);//open a snack bar to notify the student of successful submission
    },

      complete:() => setTimeout(() => {
        this.router.navigate(['/performance'])
      }, 5000),
     
      error:() =>console.log()
   }))
  }
}

  }

  //calculate the percentage progress of the student
  calculateProgress(){

    //get the number of attempts
    const attempted:any[] = this.selectedOptions.filter(option => option !== null);
   
    this.progress = Math.floor((attempted.length * 100)/this.totalQuestions);
    
    this.remaining = this.totalQuestions - attempted.length;
  
    this.progressBarColor = (this.progress >= 50) ? 'primary' : 'warn'; //checks if the student has attempted 50% questions or more,then changes color of the progress bar

  }

//checks the screen size of the current user and update the 'smallScreen' boolean flag
private mediaAlias(){

  return this.mediaService.mediaChanges().subscribe((changes:MediaChange[]) =>{

   
    this.smallScreen = changes.some(change => change.mqAlias === 'xs' || change.mqAlias === 'sm');


    
    
    this.dialogWidth = this.smallScreen ? '250px':'500px'; 
  })
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

 //
 private showPerformance(){

  this.performanceSub$ = this.testService.performanceObs$.subscribe(value => this.showMyPerformace  = value);
 }

recentAcademicPerformance(){

  if(this.showMyPerformace){

   //extract the correct oprtions for the particular test
   const correctOptions = this.testContent!.questions.map(question => question.answer);
   //get the student's recent performance
   const recentPerformance: PerformanceObject = {
    subjectName: this.subject,
    testTopic: this.topic,
    selectedOptions: this.selectedOptions,
    correctOptions:correctOptions
   }

   this.testService.showRecentPerformance(recentPerformance);

  }


}
}

//an interface that captures the information we need to display in student's performance view component
export interface PerformanceObject{

  subjectName:string,
  testTopic:string,
  selectedOptions:string[],
  correctOptions:string[]
}
