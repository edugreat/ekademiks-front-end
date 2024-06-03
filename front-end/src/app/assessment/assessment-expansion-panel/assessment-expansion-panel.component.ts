import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AssessmentsService } from '../assessments.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-assessment-expansion-panel',
  templateUrl: './assessment-expansion-panel.component.html',
  styleUrl: './assessment-expansion-panel.component.css',
})
export class AssessmentExpansionPanelComponent implements OnInit{

  

  constructor(private activatedRoute: ActivatedRoute, 
    private assessmentService:AssessmentsService,
  private router:Router){}

  //subject topics on which the assessment is based
  topics$:Observable<string[]>|undefined;

  subject = '';
  category = '';
  level = '';
  topic = ''; //topic upon which the test assessment is based


  ngOnInit(): void {
    this.getTopics();

  }


  commenceTest(topic:string) {

    console.log(`topic chosen = ${topic}`)
    console.log(`category = ${this.category}`)
    
    this.router.navigate(['/start', topic, this.category]);


    }

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

