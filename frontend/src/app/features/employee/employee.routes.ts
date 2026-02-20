import { Routes } from '@angular/router';
import { EmployeeOverviewComponent } from './pages/employee-overview/employee-overview';
import { EmployeeAssetsComponent } from './pages/employee-assets/employee-assets';



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
        path: '',
        redirectTo: 'employee-overview',
        pathMatch: 'full'
    }
];