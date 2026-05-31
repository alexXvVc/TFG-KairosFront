import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { ShellComponent } from './layout/shell';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/login/login').then(m => m.LoginComponent) },

  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent),
      },
      {
        path: 'calendar',
        loadComponent: () => import('./features/calendar/calendar-page').then(m => m.CalendarPageComponent),
      },
      {
        path: 'celebrations',
        loadComponent: () => import('./features/celebrations/celebrations-list').then(m => m.CelebrationsListComponent),
      },
      {
        path: 'celebrations/new',
        loadComponent: () => import('./features/celebrations/celebration-form').then(m => m.CelebrationFormComponent),
      },
      {
        path: 'celebrations/:id',
        loadComponent: () => import('./features/celebrations/celebration-detail').then(m => m.CelebrationDetailComponent),
      },
      {
        path: 'records',
        loadComponent: () => import('./features/records/records-list').then(m => m.RecordsListComponent),
      },
      {
        path: 'persons',
        loadComponent: () => import('./features/persons/persons-list').then(m => m.PersonsListComponent),
      },
      {
        path: 'locations',
        loadComponent: () => import('./features/locations/locations-list').then(m => m.LocationsListComponent),
      },
    ],
  },

  { path: '**', redirectTo: 'dashboard' },
];
