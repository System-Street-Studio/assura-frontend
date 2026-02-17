import { Routes } from '@angular/router';

export const employeeRoutes: Routes = [
    // { path: 'dashboard', loadComponent: ... },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];
