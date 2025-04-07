import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Routes } from '@angular/router';
import { authGuard } from '../chat/auth.guard';
import { chatGuard } from '../chat/chat.guard';
import { testDeactivateGuard, testGuard } from '../test/test.guard';
import { adminGuard } from '../admin/admin.guard';
import { notificationGuard } from '../notification.guard';

export const myAppRoutes: Routes = [
  { path: 'home', loadComponent: () => import('../home/home.component').then(m => m.HomeComponent) },
  { path: 'notifications', loadComponent: () => import('../notification-detail/notification-detail.component').then(m => m.NotificationDetailComponent), 
    canActivate: [notificationGuard], 
    canMatch: [notificationGuard] 
  },
  { path: 'assessments', loadComponent: () => import('../assessment/assessment.component').then(m => m.AssessmentComponent) },
  { path: 'supports', loadComponent: () => import('../support/support/support.component').then(m => m.SupportComponent) },
  { path: 'contact', loadComponent: () => import('../contact/contact.component').then(m => m.ContactComponent) },
  { path: 'login', loadComponent: () => import('../auth/auth.component').then(m => m.AuthComponent) },
  { path: 'error/:message', loadComponent: () => import('../shared/error-message/error-message.component').then(m => m.ErrorMessageComponent) },
  { path: 'sign-up', loadComponent: () => import('../sign-up/sign-up.component').then(m => m.SignUpComponent) },
  { path: 'performance', loadComponent: () => import('../test/performance/performance.component').then(m => m.PerformanceComponent), 
    canActivate: [authGuard], 
    canMatch: [authGuard] 
  },
  { path: 'home/:more', loadComponent: () => import('../home/home.component').then(m => m.HomeComponent) },
  { path: 'assessments/:level', loadComponent: () => import('../assessment/assessment.component').then(m => m.AssessmentComponent) },
  { path: 'disabled', loadComponent: () => import('../account-disabled/account-disabled.component').then(m => m.AccountDisabledComponent) },
  { path: 'new-group', loadComponent: () => import('../chat/new-group-chat/new-group-chat.component').then(m => m.NewGroupChatComponent), 
    canActivate: [chatGuard], 
    canMatch: [chatGuard] 
  },
  { path: 'assignment/:id', loadComponent: () => import('../assessment/assignment-attempt/assignment-attempt.component').then(m => m.AssignmentAttemptComponent), 
    canActivate: [authGuard], 
    canMatch: [authGuard] 
  },
  { path: 'group-request', loadComponent: () => import('../chat/group-request/group-request.component').then(m => m.GroupRequestComponent), 
    canActivate: [authGuard], 
    canMatch: [authGuard] 
  },
  { path: 'my-groups/:studentId', loadComponent: () => import('../chat/my-groups/my-groups.component').then(m => m.MyGroupsComponent), 
    children: [
      { path: ':group_id/:group_admin_id/:description', loadComponent: () => import('../chat/group-chat/group-chat.component').then(m => m.GroupChatComponent) }
    ], 
    canActivate: [authGuard], 
    canMatch: [authGuard] 
  },
  { path: 'assessment-panel/:subject/:category', loadComponent: () => import('../assessment/assessment-expansion-panel/assessment-expansion-panel.component').then(m => m.AssessmentExpansionPanelComponent) },
  { path: 'start/:topic/:duration/:subject/:category', loadComponent: () => import('../test/test.component').then(m => m.TestComponent), 
    canDeactivate: [testDeactivateGuard], 
    canActivate: [testGuard], 
    canMatch: [testGuard] 
  },
  { path: 'register', loadComponent: () => import('../admin/institution-registration/institution-registration.component').then(m => m.InstitutionRegistrationComponent), 
    canActivate: [adminGuard], 
    canMatch: [adminGuard] 
  },
  { path: 'register/msg', loadComponent: () => import('../admin/institution-registration/institution-registration.component').then(m => m.InstitutionRegistrationComponent), 
    canActivate: [adminGuard], 
    canMatch: [adminGuard] 
  },
  { path: 'add_student/:admin', loadComponent: () => import('../admin/institution-registration/add-student/add-student.component').then(m => m.AddStudentComponent), 
    canActivate: [adminGuard], 
    canMatch: [adminGuard] 
  },
  { path: 'assignment', loadComponent: () => import('../admin/assignment/assignment.component').then(m => m.AssignmentComponent), 
    canActivate: [adminGuard], 
    canMatch: [adminGuard] 
  },
  { path: 'no-access/:code', loadComponent: () => import('../auth/access-denied/access-denied.component').then(m => m.AccessDeniedComponent) },
  { path: 'admin/:parameter', 
    canMatch: [adminGuard], 
    loadChildren: () => import('../admin/admin.module').then(m => m.ADMIN_ROUTES) 
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(myAppRoutes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
