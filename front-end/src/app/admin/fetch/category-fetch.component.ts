import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AdminService, AssessmentCategory } from '../admin.service';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatInput } from '@angular/material/input';
import { DataSource } from '@angular/cdk/collections';
import { HttpResponse, HttpStatusCode } from '@angular/common/http';
import { ConfirmationDialogService } from '../../confirmation-dialog.service';

@Component({
  selector: 'app-category-fetch',
  templateUrl: './category-fetch.component.html',
  styleUrl: './category-fetch.component.css'
})
export class CategoryFetchComponent implements OnInit, OnDestroy, AfterViewInit{


  displayedColumns:string[] = ['category','edit', 'delete'];
  
  totalElements = 0;
  pageSize = 5;
  currentPage = 0;

  dataSource!: MatTableDataSource<string>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  @ViewChild(MatInput) editorInput!: MatInput;


  // category just being edited
  oldCategoryName = '';

  constructor(private adminService:AdminService, private router:Router, 
    private confirmation:ConfirmationDialogService
  ){}

  ngOnInit(): void {
    this.getAssessmentCategories();
  }

  ngAfterViewInit(): void {
    if(this.dataSource){

     if(this.dataSource){
      this.dataSource.paginator = this.paginator;
     }
    }
  }
  ngOnDestroy(): void {
    
  }

  private getAssessmentCategories(){

    this.adminService.fetchAssessmentCategories().subscribe({
      next:(assessmentCategories:AssessmentCategory)=> {
        
        const categories:string[] = assessmentCategories._embedded.levels.map(categories => categories.category);

        this.dataSource = new MatTableDataSource(categories);
      },

      complete:() => {

        this.dataSource.paginator = this.paginator;

        this.totalElements = this.dataSource.data.length;

      },
      error:(err) => this.router.navigate(['/error', err.error])
    })


  }


  editCategory(oldName:string, index: number) {


    this.oldCategoryName = oldName;
   

    // get the editor element
    const el = document.getElementById('editing-container');
    if(el){

      el.classList.remove('hide');
      this.editorInput.value = oldName;
    }
   
    }

    saveChanges() {

      
     
      this.adminService.updateCategoryName(this.editorInput.value, this.oldCategoryName).subscribe({
        next:(code:HttpResponse<number>) => {

          if(code.status === HttpStatusCode.Ok){}
          
        },

        error:(err) => {

          const el = document.getElementById('editing-container');
          if(el){

            el.classList.add('hide')
          }
          this.router.navigate(['/error',err.error]);
        },

        complete:() => {
          const el = document.getElementById('editing-container');
          
          if(el){

            el.classList.add('hide')

            this.editorInput.value = '';
            
          }

          // reload the page
          window.location.reload();
        }
      })
     
    }
    deleteCategory(category:number) {

      this.confirmation.confirmAction(`Sure to delete ${category} ?`);
      this.confirmation.userConfirmationResponse$.subscribe( yes =>{

        if(yes){
          this.adminService.deleteCategory(category).subscribe({
            next:(code:HttpResponse<number>) => {
              if(code.status === HttpStatusCode.Ok) window.location.reload();
            },

            error:(err) => this.router.navigate(['/error', err.error])
          })
        }
        
        
      })

      
   
    }
    looksGood() {
    
    window.history.back();
    }
    
    cancelEditing() {
      const el = document.getElementById('editing-container');
      if(el){

        this.editorInput.value = ''
        el.classList.add('hide');
      }
    }

}
