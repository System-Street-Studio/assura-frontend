import { Routes } from '@angular/router';
import { ShellComponent } from './features/shell/shell';
import { shellRoutes } from './features/shell/shell.routes';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: shellRoutes,
  },
  { path: '**', redirectTo: '' }
];
