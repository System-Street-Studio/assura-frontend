import { Routes } from '@angular/router';
import { ShellComponent } from './features/shell/shell';
import { shellRoutes } from './features/shell/shell.routes';

export const routes: Routes = [
    {
        path: '',
        component: ShellComponent,
        children: shellRoutes
    }
];
