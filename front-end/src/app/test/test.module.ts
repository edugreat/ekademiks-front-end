import { NgModule } from '@angular/core';
import { TestComponent } from './test/test.component';
import { MaterialModule } from '../material/material.module';
import { SharedModule } from '../shared/shared.module';
import { CommonModule } from '@angular/common';
import { MathJaxDirective } from '../math-jax.directive';
import { TimerComponent } from './timer/timer.component';
import { TimerPipe } from './timer/timer.pipe';
import { InstructionDialogComponent } from './instruction-dialog/instruction-dialog.component';




@NgModule({
  declarations: [
    TestComponent,
    MathJaxDirective,
    TimerComponent,
    TimerPipe,
    InstructionDialogComponent
    
  ],
  
  imports: [
    CommonModule,
    SharedModule,
    
  ],
  exports:[TestComponent, SharedModule]
})
export class TestModule { }
