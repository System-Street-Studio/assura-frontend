import { Routes } from '@angular/router';

export const maintenanceRoutes: Routes = [
    // { path: 'requests', loadComponent: ... },
    { path: '', redirectTo: 'requests', pathMatch: 'full' }
];
