import { Component, OnInit, HostListener, OnDestroy, AfterViewInit, viewChild, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { Observable, Subscription } from 'rxjs';
import { AssessmentsService, Levels } from '../../assessment/assessments.service';
import { Router } from '@angular/router';
import { MediaService } from '../../media-service';
import { HomeService } from '../home.service';
import { observableToBeFn } from 'rxjs/internal/testing/TestScheduler';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  //Observable arrays of academic levels received from the server
  levels$: Observable<Levels[]> | undefined; 

  //If the user's device is extra small
  deviceXs:boolean = false;

  rowspan = 1; //default mat-grid row span

  //If the user's device is medium
  deviceSm: boolean = false;
  mediaSubscription?:Subscription;

 welcomeMessages$:Observable<string[]> | undefined;


  //the user selected assessment test, as recieved from the radio button selection
  selectedLevel ='';

  timer:any;
  
  constructor(private mediaService: MediaService,

    private homeService:HomeService,

    private assessmentService:AssessmentsService,

  private router:Router){}
 

  ngOnInit(): void {
    
    this.getWelcomeMessages();
    this.mediaSubscription = this.mediaAlias();
    
  }


  private mediaAlias() {
   
    return this.mediaService.mediaChanges().subscribe((changes:MediaChange[]) =>{

      this.deviceXs = changes.some(change => change.mqAlias === 'xs');
      this.deviceSm = changes.some(change => change.mqAlias === 'sm');
      changes.forEach(c => console.log(c.mqAlias));

      this.rowspan = changes.some(change => change.mqAlias === 'lg' ||  change.mqAlias === 'md') ? 1.5 : 1;
    })
    
  }

  ngOnDestroy(): void {
   this.mediaSubscription?.unsubscribe();
  }

  //calls the service to retrieve the academic levels
  getAcademicLevels(){

     this.levels$ = this.assessmentService.getAssessmentLevels();
    
  }

  //handles user selection of choice of academic level for assessment to proceed
  handleSelection(){
    
    this.router.navigate(['/assessments', this.selectedLevel]);
  }


  getWelcomeMessages(){

    this.welcomeMessages$ = this.homeService.getWelecomeMessages();
  }
}

