import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../home/home.component';
import { AssessmentComponent } from '../assessment/assessment.component';
import { SupportComponent } from '../support/support/support.component';
import { ContactComponent } from '../contact/contact.component';
import { AssessmentExpansionPanelComponent } from '../assessment/assessment-expansion-panel/assessment-expansion-panel.component';
import { TestComponent } from '../test/test.component';
import { AuthComponent } from '../auth/auth.component';
import { SignUpComponent } from '../sign-up/sign-up.component';
import { PerformanceComponent } from '../test/performance/performance.component';
import { testDeactivateGuard, testGuard } from '../test/test.guard';
import { AccessDeniedComponent } from '../auth/access-denied/access-denied.component';
import { adminGuard } from '../admin/admin.guard';
import { NotificationDetailComponent } from '../notification-detail/notification-detail.component';
import { notificationGuard } from '../notification.guard';
import { ErrorMessageComponent } from '../shared/error-message/error-message.component';
import { AccountDisabledComponent } from '../account-disabled/account-disabled.component';
import { NewGroupChatComponent } from '../chat/new-group-chat/new-group-chat.component';
import {chatGuard } from '../chat/chat.guard';
import { MyGroupsComponent } from '../chat/my-groups/my-groups.component';
import { GroupChatComponent } from '../chat/group-chat/group-chat.component';
import { GroupRequestComponent } from '../chat/group-request/group-request.component';
import { authGuard } from '../chat/auth.guard';
import { InstitutionRegistrationComponent } from '../admin/institution-registration/institution-registration.component';
import { AddStudentComponent } from '../admin/institution-registration/add-student/add-student.component';



const routes: Routes = [
  { path: 'home', component: HomeComponent },
  {path: 'notifications', component:NotificationDetailComponent,

    canActivate:[notificationGuard],
    canMatch:[notificationGuard]
  },
  { path: 'assessments', component: AssessmentComponent },
  { path: 'supports', component: SupportComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'login', component: AuthComponent },
  {path: 'error/:message', component:ErrorMessageComponent},
  { path: 'sign-up', component: SignUpComponent },
  { path: 'performance', component: PerformanceComponent ,
    canActivate:[authGuard],
    canMatch:[authGuard]
  },
  { path: 'home/:more', component: HomeComponent },
  { path: 'assessments/:level', component: AssessmentComponent },
  {path: 'disabled', component: AccountDisabledComponent},
  {path: 'new-group', component: NewGroupChatComponent, canActivate:[chatGuard], canMatch:[chatGuard]
  },

  {path: 'group-request',component: GroupRequestComponent,
    canActivate:[authGuard],
    canMatch:[authGuard]
  },
  
  {path:'my-groups/:studentId', component:MyGroupsComponent,

    children:[
      {path: ':group_id/:group_admin_id/:description', component: GroupChatComponent}
    ],
    canActivate:[authGuard],
    canMatch:[authGuard]
  },
  {
    path: 'assessment-panel/:subject/:category',
    component: AssessmentExpansionPanelComponent,
  },
  {
    path: 'start/:topic/:duration/:subject/:category',
    canDeactivate: [testDeactivateGuard],
    canActivate:[testGuard],
    canMatch:[testGuard],
    component: TestComponent,
    
  },

  {path: 'register', component: InstitutionRegistrationComponent,
    canActivate:[adminGuard],
    canMatch: [adminGuard]
  },

  {path: 'add_student/:admin', component: AddStudentComponent,
    canActivate: [adminGuard],
    canMatch:[adminGuard]
  },
  
  { path: 'no-access/:code', component: AccessDeniedComponent },

  {path: 'admin/:parameter',
    canMatch:[adminGuard],
    loadChildren:() => import  ('../admin/admin.module').then(m => m.AdminModule)
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
