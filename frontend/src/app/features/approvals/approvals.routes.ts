import { Routes } from '@angular/router';

export const approvalsRoutes: Routes = [
    // { path: 'pending', loadComponent: ... },
    { path: '', redirectTo: 'pending', pathMatch: 'full' }
];
