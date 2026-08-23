import { Routes } from '@angular/router';

export const superintendentRoutes: Routes = [
    {
        path: 'overview',
        loadComponent: () => import('../overview/overview').then(m => m.OverviewComponent)
    },
    {
        path: 'depreciation',
        loadComponent: () => import('./depreciation/depreciation').then(m => m.DepreciationComponent)
    },
    {
        path: 'discarded-notes',
        loadChildren: () => import('../discarded-notes/discarded-notes.routes').then(m => m.discardedNotesRoutes)
    },
    {
        path: 'buyer',
        loadComponent: () => import('../buyer/buyer').then(m => m.BuyerComponent)
    },
    {
        path: 'lost-items',
        loadComponent: () => import('./lost-items/lost-items').then(m => m.LostItemsComponent)
    },
    { path: '', redirectTo: 'overview', pathMatch: 'full' }
];
