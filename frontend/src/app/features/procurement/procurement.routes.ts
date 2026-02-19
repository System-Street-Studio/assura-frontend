import { Routes } from '@angular/router';

export const procurementRoutes: Routes = [
    // { path: 'orders', loadComponent: ... },
    {
        path: 'purchase-orders',
        loadComponent: () => import('./pages/purchase-orders/purchase-orders.component').then(m => m.PurchaseOrdersComponent)
    },
    {
        path: 'overview',
        loadComponent: () => import('./pages/overview/overview.component').then(m => m.OverviewComponent)
    },
    { path: '', redirectTo: 'overview', pathMatch: 'full' }
];
