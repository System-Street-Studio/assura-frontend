import { Routes } from '@angular/router';

export const superintendentRoutes: Routes = [
    // { path: 'inspections', loadComponent: ... },
    { path: '', redirectTo: 'inspections', pathMatch: 'full' }
];
