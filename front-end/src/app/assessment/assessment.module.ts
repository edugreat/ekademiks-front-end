import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssessmentComponent } from './assessment/assessment.component';
import { MaterialModule } from '../material/material.module';
import { AssessmentExpansionPanelComponent } from './assessment-expansion-panel/assessment-expansion-panel.component';
import { AppRoutingModule } from '../app-routing/app-routing.module';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';




@NgModule({
    declarations: [
        AssessmentComponent,
        AssessmentExpansionPanelComponent,
        
    ],
    imports: [
        CommonModule,
        SharedModule,
        MaterialModule,
        AppRoutingModule,
        FormsModule
        
    ]
})
export class AssessmentModule { }
