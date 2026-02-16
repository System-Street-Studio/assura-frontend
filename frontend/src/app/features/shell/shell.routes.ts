import { Routes } from '@angular/router';

export const shellRoutes: Routes = [
    // child routes will go here, e.g:
    // { path: 'overview', component: OverviewComponent },
    // { path: 'my-assets', component: MyAssetsComponent },
    { path: '', redirectTo: 'overview', pathMatch: 'full' }
];
