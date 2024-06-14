import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';

import { HttpClientModule} from '@angular/common/http';
import { TestModule } from './test/test.module';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app-routing/app-routing.module';
import { ContactComponent } from './contact/contact.component';
import { HomeModule } from './home/home.module';
import { MaterialModule } from './material/material.module';
import { AssessmentModule } from './assessment/assessment.module';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './auth/auth.module';

  


@NgModule({
  declarations: [
    AppComponent,
    ContactComponent,
   
   
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
    AuthModule
  ],
  
 exports:[AuthModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
