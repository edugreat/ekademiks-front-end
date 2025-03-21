import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssessmentComponent } from './assessment.component';
import { AssessmentExpansionPanelComponent } from './assessment-expansion-panel/assessment-expansion-panel.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AssignmentAttemptComponent } from './assignment-attempt/assignment-attempt.component';




@NgModule({
    declarations: [
        AssessmentComponent,
        AssessmentExpansionPanelComponent,
        AssignmentAttemptComponent
        
    ],
    imports: [
        CommonModule,
        SharedModule ,
        FormsModule, 
        RouterModule 
        
    ]
})
export class AssessmentModule { }
