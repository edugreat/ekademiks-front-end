import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';

import { HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import { TestModule } from './test/test.module';
import { CommonModule } from '@angular/common';
import { ContactComponent } from './contact/contact.component';
import { HomeModule } from './home/home.module';
import { MaterialModule } from './material/material.module';
import { AssessmentModule } from './assessment/assessment.module';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './auth/auth.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SignUpComponent } from './sign-up/sign-up.component';
import { AuthInterceptor } from './auth/auth.interceptor';
import { AdminModule } from './admin/admin.module';
import { AppRoutingModule } from './app-routing/app-routing.module';
import { NotificationDetailComponent } from './notification-detail/notification-detail.component';
import { AccountDisabledComponent } from './account-disabled/account-disabled.component';
import { ChatModule } from './chat/chat.module';


  


@NgModule({
  declarations: [
    AppComponent,
    ContactComponent,
    SignUpComponent,
    NotificationDetailComponent,
    AccountDisabledComponent,
    
   
   
   
   
   
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
    AppRoutingModule,
    ReactiveFormsModule,
    AdminModule,
    ChatModule
  ],
  
 exports:[AuthModule],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
