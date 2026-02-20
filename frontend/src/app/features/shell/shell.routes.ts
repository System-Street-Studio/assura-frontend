
import { Routes } from '@angular/router';
import { OverviewComponent } from './pages/overview/overview';


export const shellRoutes: Routes = [
  { path: 'overview', component: OverviewComponent },
  // {
  //   path: 'inventory',
  //   loadChildren: () => import('../../inventory/inventory.routes').then(m => m.inventoryRoutes)
  // },
   {
    path: 'employee',
    loadChildren: () => import('../employee/employee.routes').then(m => m.employeeRoutes)
   },
  // {
  //   path: 'hr',
  //   loadChildren: () => import('../../hr/hr.routes').then(m => m.hrRoutes)
  // },
  // {
  //   path: 'procurement',
  //   loadChildren: () => import('../../procurement/procurement.routes').then(m => m.procurementRoutes)
  // },
  // {
  //   path: 'maintenance',
  //   loadChildren: () => import('../../maintenance/maintenance.routes').then(m => m.maintenanceRoutes)
  // },
  // {
  //   path: 'superintendent',
  //   loadChildren: () => import('../../superintendent/superintendent.routes').then(m => m.superintendentRoutes)
  // },
  // {
  //   path: 'approvals',
  //   loadChildren: () => import('../../approvals/approvals.routes').then(m => m.approvalsRoutes)
  // },
  // {
  //   path: 'reporting',
  //   loadChildren: () => import('../../reporting/reporting.routes').then(m => m.reportingRoutes)
  // },
  // {
  //   path: 'accountant',
  //   loadChildren: () => import('../../accountant/accountant.routes').then(m => m.accountantRoutes)
  // },
  // { path: '', redirectTo: 'overview', pathMatch: 'full' },
];
