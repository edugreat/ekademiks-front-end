import { Component, OnDestroy, OnInit } from '@angular/core';
import { AdminService, AssessmentInfo } from '../../admin.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-test-fech-info',
  templateUrl: './test-fetch-info.component.html',
  styleUrl: './test-fetch-info.component.css'
})
export class TestFetchInfoComponent implements OnInit, OnDestroy {


  // An array of assessment info
  private assessments:Assessment[] = [];


  paginatedAssessment:Assessment[] = [];

  private sub?:Subscription;
  

  currentPage = 0;
  private DEFAULT_PAGE_SIZE = 4;
  totalPages = 0;

  constructor(private adminService:AdminService, private router:Router,
    private activatedRoute:ActivatedRoute
  ){}
  
  
  ngOnInit(): void {

   this.activatedRoute.paramMap.subscribe(data => {
   

    const id= data.get('id');
    if(id) {

 
      this.fetchAssessments(Number(id))
    }
   })
   
  }
  ngOnDestroy(): void {

    this.sub?.unsubscribe();
    
  }

  private fetchAssessments(categoryId:number){

    this.sub = this.adminService.fetchAssessmentInfo(categoryId).subscribe({

      next:(info:AssessmentInfo) => {

        if(info){

          this.assessments = info._embedded.subjects.map(data =>({
            subjectId:data.id,
            subjectName:data.subjectName,
            tests:data.test
            }))

        }else{

          this.assessments = [];
        }
       
      },

      complete:() => {

        this.computePagination();
        this.paginatedAssessment = this.assessments.slice(this.currentPage, this.DEFAULT_PAGE_SIZE);

      }
      
    })


  }

  nextPage(){
   ++this.currentPage;

   const startIndex = this.currentPage * this.DEFAULT_PAGE_SIZE;
   const endIndex = startIndex + this.DEFAULT_PAGE_SIZE;
   const totalElements = this.assessments.length;
   if(endIndex < totalElements){

   this.paginatedAssessment = this.assessments.slice(startIndex, endIndex);
   }else{

    this.paginatedAssessment = this.assessments.slice(startIndex);
   }
  
  }

  previousPage(){

    --this.currentPage;
    const startIndex = this.currentPage + this.DEFAULT_PAGE_SIZE;
    const endIndex = startIndex + this.DEFAULT_PAGE_SIZE;
    this.paginatedAssessment = this.assessments.slice(startIndex, endIndex);


  }

  // method that computes pagination 
  // if total elements can be perfectly divided by default page size,
  // then total pages is the result of the division, else we add extra page to the result of the division
  private computePagination(){

    const totalElements = this.assessments.length;
    
    let quotient = Math.floor(totalElements/this.DEFAULT_PAGE_SIZE);
    let remainder = totalElements % this.DEFAULT_PAGE_SIZE;
    this.totalPages = (remainder !== 0) ? quotient + 1 : quotient;
  }

  // routes to the questions page supplying the given testId which is used to fetch all the questions for the given test
  fetchQuestions(topic: string, testId: number) {
   
   
    this.router.navigate([topic, testId],{relativeTo:this.activatedRoute})
    }

}

// a prototype of assessment info received from the server
type Assessment = {

  subjectId:number,
  subjectName:string,
  tests:Array<{id:number, testName:string, duration:number}>
}


