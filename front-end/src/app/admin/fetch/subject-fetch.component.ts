import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AdminService } from '../admin.service';
import { Router } from '@angular/router';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { elementAt, take } from 'rxjs';
import { MatInput } from '@angular/material/input';
import { STRING_TYPE } from '@angular/compiler';
import { HttpResponse, HttpStatusCode } from '@angular/common/http';
import { ConfirmationDialogService } from '../../confirmation-dialog.service';

@Component({
  selector: 'app-subject-fetch',
  templateUrl: './subject-fetch.component.html',
  styleUrl: './subject-fetch.component.css'
})
export class SubjectFetchComponent implements OnInit, OnDestroy, AfterViewInit {





  displayedColumns: string[] = ['category', 'subject', 'edit', 'delete'];

  totalElements = 0;
  pageSize = 5;
  currentPage = 0;

  dataSource!: MatTableDataSource<{ category: string, subject: string }>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  @ViewChild(MatInput) editorInput!: MatInput;

  // name of subject just being edited
  oldSubjectName = '';


  // index of the subject being edited
  editingIndex: number = 0;



  constructor(private adminService: AdminService, private router: Router, private confirmation: ConfirmationDialogService) { }

  ngOnInit(): void {

    this.getAssessmentSubjects();
  }
  ngOnDestroy(): void {

  }
  ngAfterViewInit(): void {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
    }
  }


  private getAssessmentSubjects() {

    this.adminService.assessmentSubjects().subscribe({
      next: (data: AssessmentSubject) => {

        const subjectArray = this.transformToArray(data);

        this.totalElements = subjectArray.length;

        this.dataSource = new MatTableDataSource(subjectArray);

        this.dataSource.paginator = this.paginator;
      },

      error: (err) => this.router.navigate(['/error', err.error]),

    })
  }

  // Flattens the key-value data object to an array of objects suitable for assigning to a data source 
  private transformToArray(data: AssessmentSubject): Array<{ category: string, subject: string }> {

    let subjectArray: Array<{ category: string, subject: string }> = [];
    for (const category in data) {
      if (data.hasOwnProperty(category)) {

        const subjects = data[category];
        subjects.forEach(subject => {

          subjectArray.push({ category: category, subject: subject });
        })

      }

    }

    return subjectArray;
  }



  editSubject(oldValue: string, index: number) {



    this.oldSubjectName = oldValue;


    this.editingIndex = index;

    // get the editor element
    const el = document.getElementById('editing-container');

    if (el) {

      el.classList.remove('hide');
      this.editorInput.value = oldValue;

    }

  }

  saveChanges() {



    //  Get the category under which the subject falls
    const category = this.dataSource.data[this.editingIndex].category;


    //  get the subject's current name
    const subjectName = this.dataSource.data[this.editingIndex].subject;

    const editedObject: { [key: string]: string } = {};
    editedObject[category] = this.editorInput.value;



    this.adminService.updateSubjectName(editedObject, this.oldSubjectName).subscribe({

      next: (code: HttpResponse<number>) => {

        if (code.status === HttpStatusCode.Ok) {

          // update the appropriate datasource element with the edited value
          this.dataSource.data[this.editingIndex].subject = this.editorInput.value;

        }
      },
      error: (err) => this.router.navigate(['/error', err.error]),

      complete: () => {


        this.editingIndex = 0;

        const el = document.getElementById('editing-container');
        if (el) el.classList.add('hide');

        //  resets the value of the mat input
        this.editorInput.value = '';
      }
    })




  }

  cancelEditing() {

    const el = document.getElementById('editing-container');
    if (el) {

      el.classList.add('hide');
      this.editorInput.value = '';
    }
  }

  looksGood() {

    window.history.back();
  }


  deleteSubject(category: string, subjectName: string, index: number) {


    this.confirmation.confirmAction(`sure to delete ${subjectName} ?`);

    this.confirmation.userConfirmationResponse$.pipe(take(1)).subscribe(yes => {

      if (yes) {

        this.adminService.deleteSubject(category, subjectName).subscribe({

          next: (code: HttpResponse<number>) => {

            if (code.status === HttpStatusCode.Ok) {

              this.dataSource.data.splice(index, 1);
            }
          },

          error: (err) => {


            this.router.navigate(['/error', err.error])

          },
        })

      }
    })
  }
}

// A key-value pair representing assessment subject subjects where the key is the category the subject belongs to, and value is the subject name
type AssessmentSubject = {

  [key: string]: Array<string>
}
