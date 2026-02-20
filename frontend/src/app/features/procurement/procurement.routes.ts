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
    {
        path: 'purchase-orders/create',
        loadComponent: () => import('./pages/po-create/po-create').then(m => m.PoCreate)
    },
    {
        path: 'purchase-orders/:id',
        loadComponent: () => import('./pages/purchase-order-details/purchase-order-details.component').then(m => m.PurchaseOrderDetailsComponent)
    },
    { path: '', redirectTo: 'overview', pathMatch: 'full' }
];
