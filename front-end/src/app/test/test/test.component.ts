import { Component, OnDestroy, OnInit } from '@angular/core';
import { TestService } from '../test.service';
import { TestContent } from '../test-interface';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { MediaService } from '../../media-service';
import { MediaChange } from '@angular/flex-layout';
import { MatDialog } from '@angular/material/dialog';
import { InstructionDialogComponent } from '../instruction-dialog/instruction-dialog.component';

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

//to be unsubscribed when the template is destroyed
questionSub:Subscription | undefined;

topic = ''; //the topic the student selected for assessment

subject = ''; //subject for which the test assessment is based
//options selected by the students
selectedOptions:any[] = [];


//boolean flag showing whether the user's screen is small
smallScreen = false;
testStarted: boolean = false; // boolean flag indicating whether the student has clicked on the start button to commence the test

 //imeUp = false; //shows whether test time is up or not. To be updated by the child's component event emitter

  constructor(private testService:TestService,
    private activatedRoute:ActivatedRoute,
    private mediaService:MediaService,
    public dialog: MatDialog
  ){}

  ngOnInit(): void {
   this.getQuestions();
   this.mediaAlias();
  }

  ngOnDestroy(): void {
    
    this.questionSub?.unsubscribe();
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
//Reminder: Reimplement to send to database after time elapses or user submits willingly
submit(timeUp:boolean) {

  if(timeUp === true){


    const attempted = this.selectedOptions.some(option => option !== null);
  

    if(attempted){
  
      this.selectedOptions.forEach(option => console.log(option))
    }else {
      console.log('No attempts made yet!')
      
    }


  }

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

}
