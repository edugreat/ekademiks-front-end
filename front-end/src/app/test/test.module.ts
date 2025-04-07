import { NgModule } from '@angular/core';
import { TestComponent } from './test.component';
import { SharedModule } from '../shared/shared.module';
import { CommonModule } from '@angular/common';

import { TimerComponent } from './timer/timer.component';
import { TimerPipe } from './timer/timer.pipe';
import { InstructionDialogComponent } from './instruction-dialog.component';
import { PerformanceComponent } from './performance/performance.component';
import { PerformanceReportComponent } from './performance/performance-report/performance-report.component';
import { DetailPageComponent } from './performance/performance-report/detail-page.component';




@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        TestComponent,
        TimerComponent,
        TimerPipe,
        InstructionDialogComponent,
        PerformanceComponent,
        PerformanceReportComponent,
        DetailPageComponent,
    ],
    exports: [TestComponent, SharedModule]
})
export class TestModule { }
