import { Routes } from '@angular/router';
import { ShellComponent } from './features/shell/shell';
import { shellRoutes } from './features/shell/shell.routes';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: '',
    component: ShellComponent,
    children: shellRoutes,
  },
  { path: '**', redirectTo: '' }
];
