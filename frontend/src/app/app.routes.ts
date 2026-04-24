import { Routes } from '@angular/router';
import { ShellComponent } from './features/shell/shell';
import { shellRoutes } from './features/shell/shell.routes';
import { authGuard } from './core/guards/auth.guard';
import { AccShellComponent } from './features/accountant/acc-shell/acc-shell';
import { accShellRoutes } from './features/accountant/acc-shell/acc-shell.routes';

export const routes: Routes = [
    {
        path: 'hr-overview',
        loadComponent: () => import('./features/hr/pages/overview/overview').then((m) => m.HrOverviewComponent),
    },
    {
        path: 'hr-my-assets',
        loadComponent: () => import('./features/hr/pages/myasset/myasset').then((m) => m.HrMyAssetComponent),
    },
    {
        path: 'hr-pending',
        loadComponent: () => import('./features/hr/pages/pending/pending').then((m) => m.HrPendingComponent),
    },
    {
        path: 'hr-assign-role',
        loadComponent: () => import('./features/hr/pages/form/form').then((m) => m.HrAssignRoleFormComponent),
    },
    {
        path: 'hr-assigned',
        loadComponent: () => import('./features/hr/pages/assigned/assigned').then((m) => m.HrAssignedComponent),
    },
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
