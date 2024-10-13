import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AssessmentsService, TopicAndDuration } from '../assessments.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-assessment-expansion-panel',
  templateUrl: './assessment-expansion-panel.component.html',
  styleUrl: './assessment-expansion-panel.component.css',
})
export class AssessmentExpansionPanelComponent implements OnInit{



  constructor(private activatedRoute: ActivatedRoute,
     private assessmentService:AssessmentsService,
    private router: Router){}

  //subject topics on which the assessment is based
  topicsAndDurations$:Observable<TopicAndDuration[]>|undefined;
  subject = '';
  category = '';
  level = '';
  


  ngOnInit(): void {
    this.getTopicAndDuration();

  }

  // get the assessment topic and its duration
  private getTopicAndDuration(){

     this.subject = this.activatedRoute.snapshot.params['subject'];
     this.category = this.activatedRoute.snapshot.params['category'];
    
    if(this.subject && this.category){

      this.topicsAndDurations$ = this.assessmentService.getTopicsAndDurations(this.subject, this.category);
      // converts to lowercase case except the initial letter
      this.level =  this.category.substring(0, 1)+''+(this.category.substring(1)).toLowerCase()

     

    }

    
  
  }

  //Triggers the commencement of test
  commenceTest(topic:string, duration:number) {
    
    if(topic && this.level){

      //routes to the TestComponent to fetch questions for the assessment
      this.router.navigate(['/start', topic, duration,  this.subject, this.category]);
    }

    }
  goBack(){

    window.history.back()
  }

  // refreshes the page incase no data was fetched on previous attempt
  refreshData() {
    
    window.location.reload()
    }
}

