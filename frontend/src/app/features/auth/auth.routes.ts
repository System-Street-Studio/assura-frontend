import { Routes } from '@angular/router';

export const authRoutes: Routes = [
    // { path: 'login', loadComponent: ... },
    { path: '', redirectTo: 'login', pathMatch: 'full' }
];
