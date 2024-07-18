import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';

import { HttpClientModule} from '@angular/common/http';
import { TestModule } from './test/test.module';
import { CommonModule } from '@angular/common';
import { ContactComponent } from './contact/contact.component';
import { HomeModule } from './home/home.module';
import { MaterialModule } from './material/material.module';
import { AssessmentModule } from './assessment/assessment.module';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './auth/auth.module';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import { SignUpComponent } from './sign-up/sign-up.component';
import { NumericDirective } from './numeric.directive';

  


@NgModule({
  declarations: [
    AppComponent,
    ContactComponent,
    SignUpComponent,
    NumericDirective,
   
   
   
  ],
  
  imports: [
    
    CommonModule,
    
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModule,
    SharedModule,
    HomeModule,
    AssessmentModule,
    TestModule,
    AuthModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatRadioModule,
    MatCardModule,
    ReactiveFormsModule
  ],
  
 exports:[AuthModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
