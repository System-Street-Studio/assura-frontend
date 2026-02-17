import { Routes } from '@angular/router';

export const reportingRoutes: Routes = [
    // { path: 'dashboard', loadComponent: ... },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];
