import { Routes } from '@angular/router';

export const accShellRoutes: Routes = [
    {
        path: 'overview',
        loadComponent: () => import('../acc-overview/acc-overview').then(m => m.AccOverviewComponent)
    },
    {
        path: 'my-assets',
        loadComponent: () => import('../../my-assets/my-assets').then(m => m.MyAssetsComponent)
    },
    {
        path: 'discarded',
        loadComponent: () => import('../acc-discarded/acc-discarded').then(m => m.AccDiscardedComponent)
    },
    {
        path: 'receipt',
        loadComponent: () => import('../acc-receipt/acc-receipt').then(m => m.AccReceiptComponent)
    },
    {
        path: 'discard-note',
        loadComponent: () => import('../acc-discard-note/acc-discard-note').then(m => m.AccDiscardNoteComponent)
    },
    {
        path: 'lose',
        loadComponent: () => import('../acc-lose/acc-lose').then(m => m.AccLoseComponent)
    },
    {
        path: 'profile',
        loadComponent: () => import('../../profile/profile').then(m => m.ProfileComponent)
    },
    { path: '', redirectTo: 'overview', pathMatch: 'full' }
];
