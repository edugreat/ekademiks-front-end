import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssessmentComponent } from './assessment/assessment.list.component';
import { MaterialModule } from '../material/material.module';
import { AssessmentExpansionPanelComponent } from './assessment-expansion-panel/assessment-expansion-panel.component';
import { AppRoutingModule } from '../app-routing/app-routing.module';



@NgModule({
  declarations: [
    AssessmentComponent,
    AssessmentExpansionPanelComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    AppRoutingModule
  ]
})
export class AssessmentModule { }
