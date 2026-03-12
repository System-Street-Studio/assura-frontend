import { Routes } from '@angular/router';
import { OverviewComponent } from './pages/division-head-overview-page/overview-page';
import { DivisionAssetsComponent } from './pages/division-assets/division-assets';
import { RequestsPageComponent } from './pages/requests-page/requests-page';
import { MaintenanceDetailsComponent } from './pages/maintenance-details/maintenance-details';
import { DiscardDetailsComponent } from './pages/discard-details/discard-details';
import { TransferDetailsComponent } from './pages/transfer-details/transfer-details';
import { NewAssetDetailsComponent } from './pages/new-asset-details/new-asset-details';
import { TransferPageComponent } from './pages/transfer-page/transfer-page';

export const approvalsRoutes: Routes = [
    // { path: 'pending', loadComponent: ... },
     {
        path: 'overview',
        component:  OverviewComponent

   },
    {
        path: 'assets',
        component:  DivisionAssetsComponent

   },
   {
        path: 'requests',
        component:  RequestsPageComponent

   },
   
  { path: 'new-asset-req/:id', component: NewAssetDetailsComponent },
  { path: 'transfer-req/:id', component: TransferDetailsComponent },
  { path: 'maintenance-req/:id', component: MaintenanceDetailsComponent },
  { path: 'discard-req/:id', component: DiscardDetailsComponent },
    

  {
        path: 'transfers',
        component:  TransferPageComponent

   },
    {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full'
    }



];
