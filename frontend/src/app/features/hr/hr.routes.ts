import { Routes } from '@angular/router';

export const hrRoutes: Routes = [
    // { path: 'staff', loadComponent: ... },
    { path: '', redirectTo: 'staff', pathMatch: 'full' }
];
