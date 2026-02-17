import { Routes } from '@angular/router';

export const accountantRoutes: Routes = [
    // { path: 'audit', loadComponent: ... },
    { path: '', redirectTo: 'audit', pathMatch: 'full' }
];
