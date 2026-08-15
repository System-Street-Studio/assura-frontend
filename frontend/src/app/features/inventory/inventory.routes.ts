import { Routes } from '@angular/router';

export const inventoryRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard').then((m) => m.DashboardComponent),
  },
  {
    path: 'assets',
    loadComponent: () =>
      import('./pages/assets/assets').then((m) => m.AssetsComponent),
  },
  {
    path: 'assets/new',
    loadComponent: () =>
      import('./pages/asset-form/asset-form').then((m) => m.AssetFormComponent),
    data: { mode: 'create' },
  },
  {
    path: 'assets/:id',
    loadComponent: () =>
      import('./pages/asset-details/asset-details').then((m) => m.AssetDetailsComponent),
  },
  {
    path: 'assets/:id/edit',
    loadComponent: () =>
      import('./pages/asset-form/asset-form').then((m) => m.AssetFormComponent),
    data: { mode: 'edit' },
  },
  {
    path: 'assets/:id/clone',
    loadComponent: () =>
      import('./pages/asset-form/asset-form').then((m) => m.AssetFormComponent),
    data: { mode: 'clone' },
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./pages/products/products').then((m) => m.ProductsComponent),
  },
  {
    path: 'products/new',
    loadComponent: () =>
      import('./pages/product-form/product-form').then((m) => m.ProductFormComponent),
    data: { mode: 'create' },
  },
  {
    path: 'products/:id/edit',
    loadComponent: () =>
      import('./pages/product-form/product-form').then((m) => m.ProductFormComponent),
    data: { mode: 'edit' },
  },
  {
    path: 'asset-requests',
    loadComponent: () =>
      import('./pages/asset-requests/asset-requests').then((m) => m.AssetRequestsComponent),
  },
  {
    path: 'maintenance',
    loadComponent: () =>
      import('./pages/maintenance/maintenance').then((m) => m.MaintenanceComponent),
  },
  {
    path: 'check-out',
    loadComponent: () =>
      import('./pages/checkout/checkout').then((m) => m.CheckoutComponent),
  },
  {
    path: 'check-in',
    loadComponent: () =>
      import('./pages/checkin/checkin').then((m) => m.CheckinComponent),
  },
  {
    path: 'informed-arrivals',
    loadComponent: () =>
      import('./pages/informed-arrivals/informed-arrivals').then((m) => m.InformedArrivalsComponent),
  },
  {
    path: 'grns',
    loadComponent: () =>
      import('./pages/grns/grns').then((m) => m.GrnsComponent),
  },
];
