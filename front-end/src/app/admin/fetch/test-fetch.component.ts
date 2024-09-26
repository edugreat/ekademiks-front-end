import { Component, OnDestroy, OnInit } from '@angular/core';
import { AdminService, AssessmentCategory } from '../admin.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-test-fetch',
  templateUrl: './test-fetch.component.html',
  styleUrl: './test-fetch.component.css'
})
export class TestFetchComponent implements OnInit, OnDestroy {


  

  categories?:Category[];

  private categorySub?:Subscription;

  
  private DEFAULT_PAGE_SIZE = 5;

  pageInfo?:paginationInfo;

  constructor(private adminService: AdminService, private router:Router){}


  ngOnInit(): void {

    this.fetchAssessmentCategories();
    
  }
  ngOnDestroy(): void {

    this.categorySub?.unsubscribe();
    
  }
  private fetchAssessmentCategories(page?: number) {  
    this.categorySub = this.adminService.fetchAssessmentCategories(page || 0, this.DEFAULT_PAGE_SIZE).subscribe({  
        next: (data: AssessmentCategory) => {  
            if (data && data._embedded && data._embedded.levels) {  
                this.categories = data._embedded.levels.map(info => ({  
                    id: info.id,  
                    category: info.category  
                }));  

                this.pageInfo = {  
                    currentPage: data.page.number,  
                    pageSize: data.page.size,  
                    totalElements: data.page.totalElements,  
                    totalPages: data.page.totalPages  
                };  
            } else {  
                // Handle the case where there is no data  
                this.categories = [];  
                this.pageInfo = {  
                    currentPage: 0,  
                    pageSize: this.DEFAULT_PAGE_SIZE,  
                    totalElements: 0,  
                    totalPages: 1  
                };  
            }  
        },  
        error: (err) => {  
            console.error('Error fetching assessment categories', err);  
            this.categories = [];  
            this.pageInfo = {  
                currentPage: 0,  
                pageSize: this.DEFAULT_PAGE_SIZE,  
                totalElements: 0,  
                totalPages: 1  
            };  
        }  
    });  
}
  // Method that fetches basic assessment information such as all subjcts name, test and their durations etc using the provided category id
  fetchAssessmentInfo(categoryId: number) {

    this.router.navigate(['f/test', categoryId])

    
    }


  nextPage() {
    
    this.fetchAssessmentCategories(this.pageInfo!.currentPage+1)


    }
    previousPage() {
    
      this.fetchAssessmentCategories(this.pageInfo!.currentPage - 1);
    }

}

type Category = {
  id:number,
  category:string
};

type paginationInfo = {

  pageSize:number,
  totalElements:number,
  totalPages:number,
  currentPage:number
}
