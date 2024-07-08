import { NgModule } from '@angular/core';
import { TestComponent } from './test/test.component';
import { MaterialModule } from '../material/material.module';
import { SharedModule } from '../shared/shared.module';
import { CommonModule } from '@angular/common';
import { MathJaxDirective } from '../math-jax.directive';
import { TimerComponent } from './timer/timer.component';
import { TimerPipe } from './timer/timer.pipe';
import { InstructionDialogComponent } from './instruction-dialog/instruction-dialog.component';
import { PerformanceComponent } from './performance/performance.component';
import { PerformanceReportComponent } from './performance/performance-report/performance-report.component';
import { ToolTipDirective } from './tool-tip.directive';




@NgModule({
  declarations: [
    TestComponent,
    MathJaxDirective,
    TimerComponent,
    TimerPipe,
    InstructionDialogComponent,
    PerformanceComponent,
    PerformanceReportComponent,
    ToolTipDirective
    
  ],
  
  imports: [
    CommonModule,
    SharedModule,
    
  ],
  exports:[TestComponent, SharedModule]
})
export class TestModule { }
