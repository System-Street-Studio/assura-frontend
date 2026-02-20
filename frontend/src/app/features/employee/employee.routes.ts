import { Routes } from '@angular/router';
import { EmployeeOverviewComponent } from './pages/employee-overview/employee-overview';



export const employeeRoutes: Routes = [
    {
        path: 'employee-overview',
        component: EmployeeOverviewComponent
    },
    
    
    {
        path: '',
        redirectTo: 'employee-overview',
        pathMatch: 'full'
    }
];