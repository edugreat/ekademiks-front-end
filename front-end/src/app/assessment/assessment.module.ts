import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssessmentComponent } from './assessment/assessment.component';
import { AssessmentExpansionPanelComponent } from './assessment-expansion-panel/assessment-expansion-panel.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';




@NgModule({
    declarations: [
        AssessmentComponent,
        AssessmentExpansionPanelComponent
        
    ],
    imports: [
        CommonModule,
        SharedModule ,
        FormsModule,  
        
    ]
})
export class AssessmentModule { }
