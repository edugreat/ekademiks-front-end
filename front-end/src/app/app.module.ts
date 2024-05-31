import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';

import { HttpClientModule} from '@angular/common/http';
import { TestModule } from './test/test.module';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app-routing/app-routing.module';
import { LoginComponent } from './login/login.component';
import { ContactComponent } from './contact/contact.component';
import { LogoutComponent } from './logout/logout.component';
import { HomeModule } from './home/home.module';
import { MaterialModule } from './material/material.module';
import { AssessmentModule } from './assessment/assessment.module';
import { SortPipe } from './sort.pipe';

  


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ContactComponent,
    LogoutComponent,
   
  ],
  imports: [
    
    CommonModule,
    AppRoutingModule,
   TestModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModule,
    HomeModule,
    AssessmentModule,
   
   
   
  ],
 // exports:[RouterModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
