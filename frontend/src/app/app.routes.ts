import { Routes } from '@angular/router';
import { SuperintendentComponent } from './features/superintendent/superintendent';
import { superintendentRoutes } from './features/superintendent/superintendent.routes';
import { AccShellComponent } from './features/accountant/acc-shell/acc-shell';
import { accShellRoutes } from './features/accountant/acc-shell/acc-shell.routes';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/role-select/role-select').then(m => m.RoleSelectComponent)
    },
    {
        path: 'superintendent',
        component: SuperintendentComponent,
        children: superintendentRoutes
    },
    {
        path: 'accountant',
        component: AccShellComponent,
        children: accShellRoutes
    }
];
