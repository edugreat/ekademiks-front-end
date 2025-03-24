import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { AssessmentsService, Levels } from '../assessment/assessments.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HomeService } from './home.service';
import { AuthService, User } from '../auth/auth.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

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
  

 welcomeMessages$:Observable<string[]> | undefined;

  private currentUser?:User;

  private currentUserSub?:Subscription;

  //the user selected assessment test, as recieved from the radio button selection
  selectedLevel ='';

  timer:any;
  
  constructor(
    private homeService:HomeService,

    private assessmentService:AssessmentsService,

  private router:Router, private activatedRoute:ActivatedRoute,
private authService:AuthService,
private breakpointObserver:BreakpointObserver
){}
 

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
      this.breakpointObserver.observe([
        Breakpoints.XSmall, // xs
        Breakpoints.Small,  // sm
        Breakpoints.Medium, // md
        Breakpoints.Large,  // lg
      ]).subscribe(result => {
        // Check for xs breakpoint
        this.deviceXs = result.breakpoints[Breakpoints.XSmall];
    
        // Check for sm breakpoint
        this.deviceSm = result.breakpoints[Breakpoints.Small];
    
        // Check for md or lg breakpoints
        const isMediumOrLarge = result.breakpoints[Breakpoints.Medium] || result.breakpoints[Breakpoints.Large];
        this.rowspan = isMediumOrLarge ? 1.5 : 1;
      });

      }
    })
    

  }


  
  ngOnDestroy(): void {
   this.currentUserSub?.unsubscribe();
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

