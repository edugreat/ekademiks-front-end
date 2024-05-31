import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../home/home/home.component';
import { AssessmentComponent } from '../assessment/assessment/assessment.component';
import { SupportComponent } from '../support/support/support.component';
import { ContactComponent } from '../contact/contact.component';
import { LoginComponent } from '../login/login.component';
import { LogoutComponent } from '../logout/logout.component';
import { AssessmentExpansionPanelComponent } from '../assessment/assessment-expansion-panel/assessment-expansion-panel.component';

const routes:Routes = [
  {path: '', component: HomeComponent},
  {path: 'assessments', component: AssessmentComponent},
  {path:'assessments/:level', component: AssessmentComponent},
  {path: 'supports', component: SupportComponent},
  {path: 'contact', component: ContactComponent},
  {path: 'login', component: LoginComponent},
  {path: 'logout', component: LogoutComponent},
  {path:'assessment-panel/:subject/:category', component: AssessmentExpansionPanelComponent}
]

@NgModule({
  imports:[RouterModule.forRoot(routes)],
   exports:[RouterModule]
  
})
export class AppRoutingModule { }
