import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AssessmentsService } from './assessments.service';
import { Observable, Subscription, finalize } from 'rxjs';

import { AuthService, User } from '../auth/auth.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { NgIf, NgFor } from '@angular/common';
import { SpinnerComponent } from '../shared/spinner/spinner.component';
import { MatTooltip } from '@angular/material/tooltip';
import { MatAnchor } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatGridList, MatGridTile } from '@angular/material/grid-list';
import { SortPipe } from '../sort.pipe';

@Component({
    selector: 'app-assessment',
    templateUrl: './assessment.component.html',
    styleUrl: './assessment.component.css',
    standalone: true,
    imports: [NgIf, SpinnerComponent, MatTooltip, MatAnchor, MatIcon, MatGridList, NgFor, MatGridTile, RouterLink, SortPipe]
})
export class AssessmentComponent implements OnInit, OnDestroy{

  //academic assessment level the component should serve to the html component
  selectedLevel:string = '';

  networkBusy = true;//flag that controls that spinning effect of the spinner


 
  // subject names based on the user selecte category
  subjectNames:string[] = [];
 

  //number of subjects returned for each level of academic assessment
  totalSubjects = 0;

  private currentUser?:User;

  subjectNamesSub:Subscription | undefined;

  private currentUserSub?:Subscription;

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
             private authService:AuthService,
            private breakpointObserver:BreakpointObserver
            ){}

  ngOnInit(): void {
    
    this._currentUser();
    this.getSubjectNames();
    //this.totalSubject = this.subjectNames.length;
    this.mediaSubscription = this.mediaAlias();
   
  }

  ngOnDestroy(): void {
    this.subjectNamesSub?.unsubscribe();
    this.mediaSubscription?.unsubscribe();

  }

 private _currentUser(){

  this.currentUserSub = this.authService.loggedInUserObs$.subscribe(user => this.currentUser = user);
 }

  //subscribe to media service to get the current media device
  private mediaAlias(){


    return this.breakpointObserver.observe([
      Breakpoints.XSmall
    ]).subscribe(result => {
      this.deviceXs = result.matches;
      this.updateGridSettings()
    })

 
  }

  // gets the student's academic level(or status)
  private get status(){

    const level = this.activatedRoute.snapshot.params['level'] ? this.activatedRoute.snapshot.params['level'] : this.DEFAULT_LEVEL ;

    return this.currentUser ? this.currentUser.status : level;;
  }

  
  //gets the subject names for the assessment for the user selected academic level
  getSubjectNames(){

   
   
    this.selectedLevel = this.status;

   


    // try fetching from the cache if data is available, else make a sever call
      if(!this.assessmentService.getSubjects(this.selectedLevel)){

   
        this.subjectNamesSub =  this.assessmentService.fetchSubjectNames(this.selectedLevel).pipe(
         finalize(() => this.networkBusy = false)
         
        ).subscribe( subjectNames =>{

         
     
          this.subjectNames = subjectNames;
     
        
         this.totalSubjects = subjectNames.length;
         this.assessmentService.subjects(this.selectedLevel, subjectNames);
     
         this.updateGridSettings(); //updates the mat-grid-list setting
     
        });
         }
         else {

          
        
           this.subjectNames = this.assessmentService.getSubjects(this.selectedLevel)!
           this.networkBusy = !this.networkBusy;
     
         }
    

   

  }

  //methods that updates number of columns the grid should occupy based on device sizes and number of subjects returned by the server
  updateGridSettings():void{

    if(this.deviceXs){
      this.col = 1;
    }else{

      this.col = Math.max(1, Math.ceil(this.totalSubjects/2));
    }
  }


  //takes the user one-step back
  goBack() {
    window.history.back()
    }
    
}
