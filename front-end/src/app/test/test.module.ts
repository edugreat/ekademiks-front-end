import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestComponent } from './test/test.component';
import { MathJaxDirective } from './math-jax.directive';
import { MaterialModule } from '../material/material.module';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';




@NgModule({
  declarations: [
    TestComponent,
    MathJaxDirective,
  ],
  imports: [
    CommonModule,
   SharedModule,
    FormsModule,
    MaterialModule
  ],
  exports:[TestComponent]
})
export class TestModule { }
