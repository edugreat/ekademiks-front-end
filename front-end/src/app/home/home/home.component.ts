import { Component, OnInit, OnDestroy } from '@angular/core';
import { MediaChange } from '@angular/flex-layout';
import { Subscription, finalize } from 'rxjs';
import { AssessmentsService, Levels } from '../../assessment/assessments.service';
import { Router } from '@angular/router';
import { MediaService } from '../../media-service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {


  //An arrays of academic levels received from the server
  levels: Levels[] = []; 

  levelSub:Subscription|undefined;

  //If the user's device is extra small
  deviceXs:boolean = false;


  //If the user's device is medium
  deviceSm: boolean = false;
  mediaSubscription?:Subscription;

  networkBusy?:boolean; //shows the network is busy, hence the spinner should be rotating
  


  //welcome message displayable on large screens
  welcomeMsg = "Join e-Kademiks for a transformative learning experience. Access tailored assessments for junior and senior high school levels, explore diverse subjects, and benefit from personalized profiles, real-time feedback, and insightful analytics. Unleash your potential and join a community dedicated to success. Start your journey now";

  //welcome message displayable on extra small screens
  weclome2 = "Embark on your academic journey with us by exploring our different range of assessments tailored for both students of junior and senior categories."
  
  //the user selected assessment test, as recieved from the radio button selection
  selectedLevel ='';
  
  constructor(private mediaService: MediaService, 
    private assessmentService:AssessmentsService,
  private router:Router){}
 

  ngOnInit(): void {
    this.mediaSubscription = this.mediaAlias();
    
   
  }


  private mediaAlias() {
   
    return this.mediaService.mediaChanges().subscribe((changes:MediaChange[]) =>{

      this.deviceXs = changes.some(change => change.mqAlias === 'xs');
      this.deviceSm = changes.some(change => change.mqAlias === 'sm');
      
    })
    
  }

  ngOnDestroy(): void {
   this.mediaSubscription?.unsubscribe();
   this.levelSub?.unsubscribe();
  }

  //calls the service to retrieve the academic levels
  getAcademicLevels(){
    this.networkBusy = true;

    console.log(this.networkBusy)
    
     this.levelSub = this.assessmentService.getAssessmentLevels().pipe(
      finalize(() => this.networkBusy = false )
     ).subscribe({
      next:(result) => this.levels = result})
    
  }

  //handles user selection of choice of academic level for assessment to proceed
  handleSelection(){
    
    this.router.navigate(['/assessments', this.selectedLevel]);
  }


  goBack() {
    
    //resets the levels array to empty so the page can reset to default display

    this.selectedLevel = '';//resets the previous user selection
    this.levels = [];
    }
}
