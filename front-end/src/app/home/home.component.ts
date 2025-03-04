import { Component, OnInit, OnDestroy } from '@angular/core';
import { MediaChange } from '@angular/flex-layout';
import { Observable, Subscription } from 'rxjs';
import { AssessmentsService, Levels } from '../assessment/assessments.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MediaService } from '../media-service';
import { HomeService } from './home.service';
import { AuthService } from '../auth/auth.service';

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

  private router:Router, private activatedRoute:ActivatedRoute,
private authService:AuthService
){}
 

  ngOnInit(): void {

    //if activation of this component is a result of the student's wish to take more assessment, then present them with assessment level rather than the usual welcome messages
    this.activatedRoute.paramMap.subscribe(params =>{

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
      this.mediaSubscription = this.mediaAlias();

      }
    })
    

  }


  private mediaAlias() {
   
    return this.mediaService.mediaChanges().subscribe((changes:MediaChange[]) =>{

      this.deviceXs = changes.some(change => change.mqAlias === 'xs');
      this.deviceSm = changes.some(change => change.mqAlias === 'sm');
      

      this.rowspan = changes.some(change => change.mqAlias === 'lg' ||  change.mqAlias === 'md') ? 1.5 : 1;
    })
    
  }

  ngOnDestroy(): void {
   this.mediaSubscription?.unsubscribe();
  }

  //calls the service to retrieve the academic levels
  getAcademicLevels(){

    if(!this.isGuestUser()){

      const level = this.authService.status;

      console.log('level '+level)

      if(level) this.router.navigate(['/assessments', level]);
    } else {

      if(! this.assessmentService.assessmentLevels){
     
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

