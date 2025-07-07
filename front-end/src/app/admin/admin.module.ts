
import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin.component').then(m => m.AdminComponent),
    children: [
      {
        path: 'test',
        loadComponent: () => import('./upload/upload-test.component').then(m => m.UploadTestComponent),
      },
      {
        path: 'fetch-tests',
        loadComponent: () => import('./fetch/test-fetch.component').then(m => m.TestFetchComponent),
      },
      {
        path: 'subject',
        loadComponent: () => import('./upload/upload-subject.component').then(m => m.UploadSubjectComponent),
      },
      {
        path: 'category',
        loadComponent: () => import('./upload/category.upload.component').then(m => m.CategoryUploadComponent),
      },
      {
        path: 'fetch-subjects',
        loadComponent: () => import('./fetch/subject-fetch.component').then(m => m.SubjectFetchComponent),
      },
      {
        path: 'fetch-categories',
        loadComponent: () => import('./fetch/category-fetch.component').then(m => m.CategoryFetchComponent),
      },
      {
        path: 'fetch-topics',
        loadComponent: () => import('./fetch/topic-fetch.component').then(m => m.TopicFetchComponent),
      },
      {
        path: 'question-bank',
        loadComponent: () => import('./bank/question-bank.component').then(m => m.QuestionBankComponent),
      },
      {
        path: 'options-bank',
        loadComponent: () => import('./bank/options-bank.component').then(m => m.OptionsBankComponent),
      },
      {
        path: 'preview-test',
        loadComponent: () => import('./upload/preview-test.component').then(m => m.PreviewTestComponent),
      },
      {
        path: 'instructions',
        loadComponent: () => import('./upload/instructions/instructions.component').then(m => m.InstructionsComponent),
      },
      {
        path: 'notifications',
        loadComponent: () => import('./upload/notifications/notifications.component').then(m => m.NotificationsComponent),
      },
      {
        path: 'student-list',
        loadComponent: () => import('./fetch/student-list/student-list.component').then(m => m.StudentListComponent),
      },
      {
        path: 'student-list/:id',
        loadComponent: () =>
          import('./fetch/student-list/student-details-page/student-details-page.component').then(
            m => m.StudentDetailsPageComponent
          ),
      },
      {
        path: 'fetch-tests/:categoryId',
        loadComponent: () => import('./fetch/test-fetch-info/test-fetch-info.component').then(m => m.TestFetchInfoComponent),
      },
      {
        path: 'assessment-questions',
        loadComponent: () =>
          import('./fetch/assessment-questions/assessment-questions.component').then(m => m.AssessmentQuestionsComponent),
      },
      {
        path: 'institution-registration',
        loadComponent: () =>
          import('./institution-registration/institution-registration.component').then(m => m.InstitutionRegistrationComponent),
      },
      {
        path: 'add-student',
        loadComponent: () => import('./institution-registration/add-student/add-student.component').then(m => m.AddStudentComponent),
      },
      {
        path: 'assignment',
        loadComponent: () => import('./assignment/assignment.component').then(m => m.AssignmentComponent),
      },
    ],
    canActivate: [() => import('./admin.guard').then(m => m.adminGuard)],
  },
];

