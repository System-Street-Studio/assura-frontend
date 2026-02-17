import { Routes } from '@angular/router';

export const procurementRoutes: Routes = [
    // { path: 'orders', loadComponent: ... },
    { path: '', redirectTo: 'orders', pathMatch: 'full' }
];
