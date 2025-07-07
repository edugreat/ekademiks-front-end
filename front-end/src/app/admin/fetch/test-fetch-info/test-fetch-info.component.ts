import { Component, OnDestroy, OnInit } from '@angular/core';
import { AdminService, AssessmentInfo } from '../../admin.service';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { Subscription, take } from 'rxjs';
import { ConfirmationDialogService } from '../../../confirmation-dialog.service';
import { NgIf, NgFor } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { NumericDirective } from '../../../shared/numeric.directive';

@Component({
    selector: 'app-test-fech-info',
    templateUrl: './test-fetch-info.component.html',
    styleUrl: './test-fetch-info.component.css',
    standalone: true,
    imports: [NgIf, MatProgressSpinner, NgFor, MatFormField, MatLabel, MatInput, FormsModule, NumericDirective, RouterOutlet]
})
export class TestFetchInfoComponent implements OnInit, OnDestroy {







  // An array of assessment info
  private assessments: Assessment[] = [];


  paginatedAssessment: Assessment[] = [];

  private sub?: Subscription;


  currentPage = 0;
  private DEFAULT_PAGE_SIZE = 4;
  totalPages = 0;

  // shows if the user is currently editing the page .
  // This is used to display the input field
  editingMode = false;

  // ID of the test to be edited
  editingId: number | undefined = 0;

  constructor(private adminService: AdminService, private router: Router,
    private activatedRoute: ActivatedRoute, private confirmService:ConfirmationDialogService
  ) { }


  ngOnInit(): void {

    this.activatedRoute.paramMap.subscribe(data => {


      const id = data.get('categoryId');
      if (id) {


      
        this.fetchAssessments(Number(id))
      }
    })

  }
  ngOnDestroy(): void {

    this.sub?.unsubscribe();

  }

  private fetchAssessments(categoryId: number) {

    this.sub = this.adminService.fetchAssessmentInfo(categoryId).subscribe({

      next: (info: AssessmentInfo) => {

        if (info) {

          this.assessments = info._embedded.subjects.map(data => ({
            subjectId: data.id,
            subjectName: data.subjectName,
            tests: data.test
          }))

        } else {

          this.assessments = [];
        }

      },

      complete: () => {

        this.computePagination();
        this.paginatedAssessment = this.assessments.slice(this.currentPage, this.DEFAULT_PAGE_SIZE);

      }

    })


  }

  nextPage() {
    ++this.currentPage;

    const startIndex = this.currentPage * this.DEFAULT_PAGE_SIZE;
    const endIndex = startIndex + this.DEFAULT_PAGE_SIZE;
    const totalElements = this.assessments.length;
    if (endIndex < totalElements) {

      this.paginatedAssessment = this.assessments.slice(startIndex, endIndex);
    } else {

      this.paginatedAssessment = this.assessments.slice(startIndex);
    }

  }

  previousPage() {

    --this.currentPage;
    const startIndex = this.currentPage + this.DEFAULT_PAGE_SIZE;
    const endIndex = startIndex + this.DEFAULT_PAGE_SIZE;
    this.paginatedAssessment = this.assessments.slice(startIndex, endIndex);


  }

  // method that computes pagination 
  // if total elements can be perfectly divided by default page size,
  // then total pages is the result of the division, else we add extra page to the result of the division
  private computePagination() {

    const totalElements = this.assessments.length;

    let quotient = Math.floor(totalElements / this.DEFAULT_PAGE_SIZE);
    let remainder = totalElements % this.DEFAULT_PAGE_SIZE;
    this.totalPages = (remainder !== 0) ? quotient + 1 : quotient;
  }

  // routes to the questions page supplying the given testId which is used to fetch all the questions for the given test
  fetchQuestions(topic: string, testId: number) {


    this.router.navigate([topic, testId], { relativeTo: this.activatedRoute })
  }


  // save changes made on the view page
  saveChanges(topic:string, duration:number, id:number) {

    this.editingMode = !this.editingMode;

    const modifying:{topic:string, duration:number} = {topic: topic, duration};
    this.adminService.modifyAssessment(modifying, id).subscribe({

      error: (err) => {
        this.router.navigate(['/error', err.error])
      },

      complete: () => this.editingId = undefined
    })





  }


  // assessment to be edited
  editTest(testId: number) {

    this.editingMode = true;

    this.editingId = testId

  }



  // cancel edit operation
  cancelEdit() {

    this.editingMode = !this.editingMode;
    this.editingId = undefined;

  }

  // deletes an assessment
  delete(testId: number, testName:string) {

    this.confirmService.confirmAction(`Delete ${testName} ?`);

    this.confirmService.userConfirmationResponse$.pipe(take(1)).subscribe(yes =>{

      if(yes){
        this.deleteAssessment(testId);

      }
    }) 
    
   
    
  }

  private deleteAssessment(testId:number){

    this.adminService.deleteAssessment(testId).subscribe({

      error:(error) => this.router.navigate(['/error', error.error]),

      complete:() => location.reload()

    })
  }

}

// a prototype of assessment info received from the server
type Assessment = {

  subjectId: number,
  subjectName: string,
  tests: Array<{ id: number, testName: string, duration: number }>
}


