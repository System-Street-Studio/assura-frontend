import { Routes } from '@angular/router';

export const shellRoutes: Routes = [
    {
        path: 'overview',
        loadComponent: () => import('../overview/overview').then(m => m.OverviewComponent)
    },
    {
        path: 'my-assets',
        loadComponent: () => import('../my-assets/my-assets').then(m => m.MyAssetsComponent)
    },
    {
        path: 'discarded-notes',
        loadChildren: () => import('../discarded-notes/discarded-notes.routes').then(m => m.discardedNotesRoutes)
    },
    { path: '', redirectTo: 'discarded-notes', pathMatch: 'full' }
];
