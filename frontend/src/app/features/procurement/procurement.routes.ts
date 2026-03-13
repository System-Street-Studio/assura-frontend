import { Routes } from '@angular/router';

export const procurementRoutes: Routes = [
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
    {
        path: 'suppliers',
        loadComponent: () => import('./pages/suppliers/suppliers.component').then(m => m.SuppliersComponent)
    },
    {
        path: 'suppliers/create',
        loadComponent: () => import('./pages/supplier-create/supplier-create.component').then(m => m.SupplierCreateComponent)
    },
    {
        path: 'suppliers/:id',
        loadComponent: () => import('./pages/supplier-details/supplier-details.component').then(m => m.SupplierDetailsComponent)
    },
    {
        path: 'maintenance',
        loadComponent: () => import('./pages/maintenance/maintenance.component').then(m => m.ProcurementMaintenanceComponent)
    },
    {
        path: 'maintenance/note/:id',
        loadComponent: () => import('./pages/maintenance-note/maintenance-note.component').then(m => m.MaintenanceNoteComponent)
    },
    {
        path: 'maintenance/create',
        loadComponent: () => import('./pages/maintenance-note-create/maintenance-note-create.component').then(m => m.MaintenanceNoteCreateComponent)
    },
    {
        path: 'maintenance/repairing-firms',
        loadComponent: () => import('./pages/repairing-firms/repairing-firms.component').then(m => m.RepairingFirmsComponent)
    },
    {
        path: 'maintenance/repairing-firms/create',
        loadComponent: () => import('./pages/repairing-firm-create/repairing-firm-create.component').then(m => m.RepairingFirmCreateComponent)
    },
    {
        path: 'new-arrivals',
        loadComponent: () => import('./pages/new-arrivals/new-arrivals.component').then(m => m.NewArrivalsComponent)
    },
    {
        path: 'my-assets',
        loadComponent: () => import('./pages/my-assets/my-assets').then(m => m.ProcurementMyAssetsComponent)
    },
    { path: '', redirectTo: 'overview', pathMatch: 'full' }
];
