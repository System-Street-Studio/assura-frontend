import { Routes } from '@angular/router';
import { EmployeeOverviewComponent } from './pages/employee-overview/employee-overview';
import { EmployeeAssetsComponent } from './pages/employee-assets/employee-assets';
import { RequestsMainComponent } from './pages/requests-main/requests-main';
import { NewAssetRequestComponent } from './pages/new-asset-request/new-asset-request';


export const employeeRoutes: Routes = [
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
        path: '',
        redirectTo: 'employee-overview',
        pathMatch: 'full'
    }
];