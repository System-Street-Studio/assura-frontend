import { Routes } from '@angular/router';
import { ShellComponent } from './features/shell/shell';
import { shellRoutes } from './features/shell/shell.routes';
import { AccShellComponent } from './features/accountant/acc-shell/acc-shell';
import { accShellRoutes } from './features/accountant/acc-shell/acc-shell.routes';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'superintendent',
        pathMatch: 'full'
    },
    {
        path: 'superintendent',
        component: ShellComponent,
        children: shellRoutes
    },
    {
        path: 'accountant',
        component: AccShellComponent,
        children: accShellRoutes
    }
];
