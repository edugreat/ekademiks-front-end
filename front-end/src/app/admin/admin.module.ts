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
import { NumericDirective } from '../shared/numeric.directive';

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
  declarations: [ AdminComponent, uploadComponents, fetchComponents, bankComponents],
  imports: [CommonModule, SharedModule, AdminRoutingModule],
})
export class AdminModule {}
