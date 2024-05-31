import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssessmentComponent } from './assessment/assessment.component';
import { MaterialModule } from '../material/material.module';
import { AssessmentExpansionPanelComponent } from './assessment-expansion-panel/assessment-expansion-panel.component';
import { AppRoutingModule } from '../app-routing/app-routing.module';
import { SortPipe } from '../sort.pipe';




@NgModule({
    declarations: [
        AssessmentComponent,
        AssessmentExpansionPanelComponent,
        SortPipe
    ],
    imports: [
        CommonModule,
        MaterialModule,
        AppRoutingModule,
        
    ]
})
export class AssessmentModule { }
