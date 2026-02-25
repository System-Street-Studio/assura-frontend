import { Routes } from '@angular/router';
import { OverviewComponent } from './pages/overview-page/overview-page';
import { DivisionAssetsComponent } from './pages/division-assets/division-assets';
import { RequestsPageComponent } from './pages/requests-page/requests-page';
import { NewAssetReqComponent } from './pages/new-asset-req/new-asset-req';
import { TransferReqComponent } from './pages/transfer-req/transfer-req';

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
    { 
    path: 'new-asset-req/:id', 
    component: NewAssetReqComponent
  },
   
  { path: 'transfer-req/:id', 
    component: TransferReqComponent },
    
    {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full'
    }



];
