import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../home/home/home.component';
import { AssessmentComponent } from '../assessment/assessment/assessment.component';
import { SupportComponent } from '../support/support/support.component';
import { ContactComponent } from '../contact/contact.component';
import { AssessmentExpansionPanelComponent } from '../assessment/assessment-expansion-panel/assessment-expansion-panel.component';
import { TestComponent } from '../test/test/test.component';
import { AuthComponent } from '../auth/auth/auth.component';
import { SignUpComponent } from '../sign-up/sign-up.component';

const routes:Routes = [
 {path: 'home', component: HomeComponent},
  {path: 'assessments', component: AssessmentComponent},
  {path:'assessments/:level', component: AssessmentComponent},
  {path: 'supports', component: SupportComponent},
  {path: 'contact', component: ContactComponent},
  {path: 'login', component: AuthComponent},
  {path:'assessment-panel/:subject/:category', component: AssessmentExpansionPanelComponent},
  {path: 'start/:topic/:duration/:subject/:category', component: TestComponent},
  {path: 'sign-up', component: SignUpComponent},
  {path: '', redirectTo: 'login', pathMatch:'full'},
  
]

@NgModule({
  imports:[RouterModule.forRoot(routes)],
   exports:[RouterModule]
  
})
export class AppRoutingModule { }
