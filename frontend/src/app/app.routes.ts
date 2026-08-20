import { Routes } from '@angular/router';
import { ShellComponent } from './features/shell/shell';
import { shellRoutes } from './features/shell/shell.routes';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { ROLES } from './core/constants/roles';
import { SuperintendentComponent } from './features/superintendent/superintendent';
import { superintendentRoutes } from './features/superintendent/superintendent.routes';
import { AccShellComponent } from './features/accountant/acc-shell/acc-shell';
import { accShellRoutes } from './features/accountant/acc-shell/acc-shell.routes';

export const routes: Routes = [
    {
        path: 'auth',
        loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
    },
    {
        path: 'pending-assignment',
        loadComponent: () => import('./features/auth/pages/pending-assignment/pending-assignment').then(m => m.PendingAssignmentComponent),
        canActivate: [authGuard],
    },
    {
        path: 'register-system-admin',
        loadComponent: () => import('./features/auth/pages/register-system-admin/register-system-admin').then(m => m.RegisterSystemAdminComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: [ROLES.ADMIN, ROLES.SYSTEM_ADMIN] },
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
        path: 'superintendent',
        component: SuperintendentComponent,
        children: superintendentRoutes
    },
    {
        path: 'accountant',
        component: AccShellComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: [ROLES.ACCOUNTANT, ROLES.ADMIN] },
        children: accShellRoutes
    },
    {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile').then(m => m.ProfileComponent),
        canActivate: [authGuard]
    },
    {
        path: '',
        component: ShellComponent,
        canActivate: [authGuard],
        children: shellRoutes,
    },
    { path: '**', redirectTo: '' }
];
