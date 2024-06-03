import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AssessmentsService } from '../assessments.service';
import { Observable, Subscription } from 'rxjs';
import { MediaService } from '../../media-service';
import { MediaChange } from '@angular/flex-layout';

@Component({
  selector: 'app-assessment',
  templateUrl: './assessment.component.html',
  styleUrl: './assessment.component.css'
})
export class AssessmentComponent implements OnInit, OnDestroy{

  //academic assessment level the component should serve to the html component
  selectedLevel = '';


  //subject names received from the network call
  subjectNames:string[] = [];

  //number of subjects returned for each level of academic assessment
  totalSubject:number = 0;

  subjectNamesSub:Subscription | undefined;

  //Number of columns the mat-grid should span
  col = 0;

  //extra small device
  deviceXs = false;

  //media changes subscriptions
  mediaSubscription:Subscription | undefined;

  //default level for assessment is JUNIOR
   DEFAULT_LEVEL = 'JUNIOR';

  constructor(private activatedRoute: ActivatedRoute,
              private assessmentService:AssessmentsService,
              private mediaService: MediaService
  ){}

  ngOnInit(): void {
    
    
    this.getSubjectNames();
    //this.totalSubject = this.subjectNames.length;
    this.mediaSubscription = this.mediaAlias();
   
  }

  ngOnDestroy(): void {
    this.subjectNamesSub?.unsubscribe();
    this.mediaSubscription?.unsubscribe();

  }

  //subscribe to media service to get the current media device
  private mediaAlias(){
  return this.mediaService.mediaChanges().subscribe((changes: MediaChange[]) =>{

    //returns true if the current device is extra small
  this.deviceXs = changes.some(change => change.mqAlias === 'xs');

  this.updateGridSettings();
  
})

  }

  //gets the subject names for the assessment for the user selected academic level
  getSubjectNames(){

    this.selectedLevel = this.activatedRoute.snapshot.params['level'];

    if(this.selectedLevel){//when activated router is a result of user's selection of a particular assessment

      
   this.subjectNamesSub =  this.assessmentService.fetchSubjectNames(this.selectedLevel).subscribe(subjectNames => {
    this.subjectNames = subjectNames;
    this.totalSubject = subjectNames.length;

    this.updateGridSettings(); //updates the mat-grid-list setting

   });
    } else {//if there was no user selection for assessment level, then default to 'JUNIOR' category assessments

      this.selectedLevel = this.DEFAULT_LEVEL; //set selected level to the default value
      this.subjectNamesSub = this.assessmentService.fetchSubjectNames(this.selectedLevel).subscribe(subjectNames =>{

        this.subjectNames = subjectNames;
        this.totalSubject= subjectNames.length;

        this.updateGridSettings(); //updates the mat-grid-list setting
   
      })
    }
  }

  //methods that updates number of columns the grid should occupy based on device sizes and number of subjects returned by the server
  updateGridSettings():void{

    if(this.deviceXs){
      this.col = 1;
    }else{

      this.col = Math.max(1, Math.ceil(this.totalSubject/2));
    }
  }


  //takes the user one-step back
  goBack() {
    window.history.back()
    }
    
}
