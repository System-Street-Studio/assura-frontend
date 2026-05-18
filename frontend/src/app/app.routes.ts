import { Routes } from '@angular/router';
import { ShellComponent } from './features/shell/shell';
import { shellRoutes } from './features/shell/shell.routes';
import { authGuard } from './core/guards/auth.guard';
import { AccShellComponent } from './features/accountant/acc-shell/acc-shell';
import { accShellRoutes } from './features/accountant/acc-shell/acc-shell.routes';

export const routes: Routes = [
    {
        path: 'auth',
        loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
    },
    {
        path: 'reporting',
        component: ShellComponent,
        children: [
            {
                path: '',
                loadChildren: () => import('./features/reporting/reporting.routes').then((m) => m.reportingRoutes),
            },
        ],
    },
    {
        path: '',
        component: ShellComponent,
        canActivate: [authGuard],
        children: shellRoutes,
    },
    {
        path: 'accountant',
        component: AccShellComponent,
        children: accShellRoutes
    },
    {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile').then(m => m.ProfileComponent),
        canActivate: [authGuard]
    },
    { path: '**', redirectTo: '' }
];
