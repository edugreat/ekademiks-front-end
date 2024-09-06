import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { UploadSubjectComponent } from './upload/upload-subject.component';
import { CategoryFetchComponent } from './fetch/category-fetch.component';
import { SubjectFetchComponent } from './fetch/subject-fetch.component';
import { TestFetchComponent } from './fetch/test-fetch.component';
import { TopicFetchComponent } from './fetch/topic-fetch.component';
import { CategoryUploadComponent } from './upload/category.upload.component';
import { UploadTestComponent } from './upload/upload-test.component';
import { adminGuard } from './admin.guard';
import { StudentListComponent } from './fetch/student-list/student-list.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    canActivate:[adminGuard],
   canActivateChild: [adminGuard],
    children: [
     
      { path: 'u/subject', component: UploadSubjectComponent },
      { path: 'u/category', component: CategoryUploadComponent },
      {path: 'u/test', component: UploadTestComponent},
      { path: 'f/test', component: TestFetchComponent },
      { path: 'f/subject', component: SubjectFetchComponent },
      { path: 'f/category', component: CategoryFetchComponent },
      { path: 'f/topic', component: TopicFetchComponent },
      {path:'students-list', component: StudentListComponent}
    ],
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
