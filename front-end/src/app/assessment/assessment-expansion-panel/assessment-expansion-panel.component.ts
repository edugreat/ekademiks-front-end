import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AssessmentsService } from '../assessments.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-assessment-expansion-panel',
  templateUrl: './assessment-expansion-panel.component.html',
  styleUrl: './assessment-expansion-panel.component.css',
})
export class AssessmentExpansionPanelComponent implements OnInit{

  constructor(private activatedRoute: ActivatedRoute, private assessmentService:AssessmentsService){}

  //subject topics on which the assessment is based
  topics$:Observable<string[]>|undefined;

  subject = '';
  category = '';
  level = '';


  ngOnInit(): void {
    this.getTopics();

  }

  //implement onint
  //declare the coonstructor and inject Assessment service and activated route
  //grab the router param ['subject]
  //fetch from the server, all topics under the subject
  //design expansion panel 

  private getTopics(){

     this.subject = this.activatedRoute.snapshot.params['subject'];
     this.category = this.activatedRoute.snapshot.params['category'];
    
    if(this.subject && this.category){

      this.topics$ = this.assessmentService.getTopics(this.subject, this.category);
      this.level =  this.category.substring(0, 1)+''+(this.category.substring(1)).toLowerCase()

     

    }

  
  }
  goBack(){

    window.history.back()
  }
  
}

