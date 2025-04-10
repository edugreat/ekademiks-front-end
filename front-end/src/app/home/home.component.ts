import { Component, OnInit, OnDestroy, inject, effect } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { AssessmentsService, Levels } from '../assessment/assessments.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HomeService } from './home.service';
import { AuthService, User } from '../auth/auth.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { WelcomeComponent } from './welcome/welcome.component';
import { MatGridList, MatGridTile } from '@angular/material/grid-list';
import { MatAnchor, MatButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { BreakpointService } from '../breakpoint.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    standalone: true,

    
    imports: [NgIf, WelcomeComponent, MatGridList, MatGridTile, MatAnchor, MatDivider, MatIcon, RouterLink, MatRadioGroup, FormsModule, NgFor, MatRadioButton, MatButton, AsyncPipe],

  })
export class HomeComponent implements OnInit, OnDestroy {


  //Observable arrays of academic levels received from the server
  levels$: Observable<Levels[]> | undefined; 

  //If the user's device is extra small
  deviceXs:boolean = false;

  rowspan = 1; //default mat-grid row span

  // subscribes to the breakpointService to get notified of the user's device description
 userDevice = toSignal(this.breakpointService.breakpoint$);




  private breakpointSub?:Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private assessmentService: AssessmentsService,
    private homeService: HomeService,
    private breakpointService: BreakpointService
  ) { 

   effect(() => {

    if(this.userDevice() === breakpointService.LG || this.userDevice() === breakpointService.MD){

      this.rowspan = 1.5;
    }
   })
  }
  

 welcomeMessages$:Observable<string[]> | undefined;

  private currentUser?:User;

  private currentUserSub?:Subscription;

  //the user selected assessment test, as recieved from the radio button selection
  selectedLevel ='';

  timer:any;
  
   
 

  ngOnInit(): void {

    //if activation of this component is a result of the student's wish to take more assessment, then present them with assessment level rather than the usual welcome messages
    this.activatedRoute.paramMap.subscribe(params =>{

      this._currentUser();

      const param = params.get('more');
      if(param !== null){

        const more = (param === 'true');

       
        if(more){

          this.getAcademicLevels();
        }else{
          this.router.navigate(['/home'])
        }
      }else{
      this.getWelcomeMessages();
    
      }
    })
    

  }


  
  ngOnDestroy(): void {
   this.currentUserSub?.unsubscribe();
   this.breakpointSub?.unsubscribe();

   
  }



  private _currentUser(){

    // subscribe to get up to date object of logged user
    this.currentUserSub = this.authService.loggedInUserObs$.subscribe(user => {

      this.currentUser = user
    
    });


  }

  //calls the service to retrieve the academic levels
  getAcademicLevels(){

    if(!this.isGuestUser()){

      // get the academic status of current user(SENIOR or JUNIOR status)
      const level = this.currentUser?.status;

      console.log('level '+level)

      if(level) this.router.navigate(['/assessments', level]);
    } else {

      // get assessment levels from in-app cache or from the server if not present
      if(!this.assessmentService.assessmentLevels){
     
        this.levels$ = this.assessmentService.getAssessmentLevels();
         this.assessmentService.assessmentLevels = this.levels$;
  
      }else{
         
        this.levels$ = this.assessmentService.assessmentLevels;
  
      }
    }

   
     
  }

  //handles user selection of choice of academic level for assessment to proceed
  handleSelection(){
    
    this.router.navigate(['/assessments', this.selectedLevel]);
  }


  getWelcomeMessages(){

    this.welcomeMessages$ = this.homeService.getWelecomeMessages();
  }

  

  isAdmin(): boolean {
    return this.authService.isAdmin;
    }

    isLoggedIn():boolean{

      return this.authService.isLoggedIn
    }

    isGuestUser():boolean{

      return !this.authService.isLoggedIn;
    }
}

