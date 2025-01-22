import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadTestComponent } from './upload/upload-test.component';
import { UploadSubjectComponent } from './upload/upload-subject.component';
import { CategoryUploadComponent } from './upload/category.upload.component';
import { TestFetchComponent } from './fetch/test-fetch.component';
import { SubjectFetchComponent } from './fetch/subject-fetch.component';
import { CategoryFetchComponent } from './fetch/category-fetch.component';
import { TopicFetchComponent } from './fetch/topic-fetch.component';
import { QuestionBankComponent } from './bank/question-bank.component';
import { OptionsBankComponent } from './bank/options-bank.component';

import { SharedModule } from '../shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { PreviewTestComponent } from './upload/preview-test.component';
import { InstructionsComponent } from './upload/instructions/instructions.component';
import { NotificationsComponent } from './upload/notifications/notifications.component';
import { StudentListComponent } from './fetch/student-list/student-list.component';
import { StudentDetailsPageComponent } from './fetch/student-list/student-details-page/student-details-page.component';
import { TestFetchInfoComponent } from './fetch/test-fetch-info/test-fetch-info.component';
import { AssessmentQuestionsComponent } from './fetch/assessment-questions/assessment-questions.component';
import { InstitutionRegistrationComponent } from './institution-registration/institution-registration.component';
import { AddStudentComponent } from './institution-registration/add-student/add-student.component';
import { AssignmentComponent } from './assignment/assignment.component';

const uploadComponents = [
 
  UploadTestComponent,
  UploadSubjectComponent,
  CategoryUploadComponent,
];

const fetchComponents = [
  TestFetchComponent,
  SubjectFetchComponent,
  CategoryFetchComponent,
  TopicFetchComponent,
  
];

const bankComponents = [QuestionBankComponent, OptionsBankComponent];

@NgModule({
  declarations: [ AdminComponent, uploadComponents, fetchComponents, bankComponents, PreviewTestComponent, InstructionsComponent, NotificationsComponent, StudentListComponent, StudentDetailsPageComponent, TestFetchInfoComponent, AssessmentQuestionsComponent, InstitutionRegistrationComponent, AddStudentComponent, AssignmentComponent],
  imports: [CommonModule, SharedModule, AdminRoutingModule],
})
export class AdminModule {}
