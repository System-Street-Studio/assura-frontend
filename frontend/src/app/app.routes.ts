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
        path: 'reporting-dashboard',
        loadComponent: () => import('./features/reporting/pages/dashboard/reporting-dashboard').then((m) => m.ReportingDashboardComponent),
    },
    {
        path: 'reporting-assets',
        loadComponent: () => import('./features/reporting/pages/assets/reporting-assets').then((m) => m.ReportingAssetsComponent),
    },
    {
        path: 'reporting-audit-logs',
        loadComponent: () => import('./features/reporting/pages/audit-log/audit-log').then((m) => m.AuditLogComponent),
    },
    {
        path: 'reporting-reports',
        loadComponent: () => import('./features/reporting/pages/reports/reports').then((m) => m.ReportsComponent),
    },
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
