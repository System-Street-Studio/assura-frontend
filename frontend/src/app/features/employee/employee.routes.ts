import { Routes } from '@angular/router';
import { EmployeeOverviewComponent } from './pages/employee-overview/employee-overview';
import { EmployeeAssetsComponent } from './pages/employee-assets/employee-assets';
import { RequestsMainComponent } from './pages/requests-main/requests-main';
import { NewAssetRequestComponent } from './pages/new-asset-request/new-asset-request';
import { MaintenanceFormComponent } from './pages/maintenance-form/maintenance-form';
import { DiscardFormComponent } from './pages/discard-form/discard-form';
import { TransferFormComponent } from './pages/transfer-form/transfer-form';
import { AllRequestsComponent } from './pages/all-emp-requests/all-emp-requests';
import { TransferPageComponent } from './pages/transfer-page/transfer-page';
import { ReqMoreDetail } from './pages/req-more-detail/req-more-detail';


export const employeeRoutes: Routes = [
      {
        path: '',
        redirectTo: 'employee-overview',
        pathMatch: 'full'
    },
    {
        path: 'employee-overview',
        component: EmployeeOverviewComponent
    },
   {
        path: 'employee-assets',
        component: EmployeeAssetsComponent
   },
   {
        path: 'requests-main',
        component:RequestsMainComponent 

   },
   {
        path: 'new-asset-request',
        component:NewAssetRequestComponent 

   },
    {
        path: 'maintenance-form',
        component:MaintenanceFormComponent 

   },
   {
        path: 'discard-form',
        component:DiscardFormComponent 

   },
   {
        path: 'transfer-form',
        component:TransferFormComponent 

   },
   {
        path: 'all-emp-requests',
        component:AllRequestsComponent 

   },
    {
        path: 'transfer-page',
        component:TransferPageComponent 

   },
    {
        path: 'request-details/:id',
        component: ReqMoreDetail
   },
    
   
];