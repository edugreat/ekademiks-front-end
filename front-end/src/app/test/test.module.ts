import { NgModule } from '@angular/core';
import { TestComponent } from './test/test.component';
import { MaterialModule } from '../material/material.module';
import { SharedModule } from '../shared/shared.module';
import { CommonModule } from '@angular/common';
import { MathJaxDirective } from '../math-jax.directive';




@NgModule({
  declarations: [
    TestComponent,
    MathJaxDirective,
    
  ],
  imports: [
    MaterialModule,
    CommonModule,
    SharedModule,
    
  ],
  exports:[TestComponent, SharedModule]
})
export class TestModule { }
