import { Routes } from '@angular/router';
import { OverviewComponent } from './pages/overview/overview';

export const shellRoutes: Routes = [
  { path: 'overview', component: OverviewComponent },
  // { path: 'my-assets', component: MyAssetsComponent },
  { path: '', redirectTo: 'overview', pathMatch: 'full' },
];
