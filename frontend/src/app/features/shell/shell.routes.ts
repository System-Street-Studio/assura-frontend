import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';
import { ROLES } from '../../core/constants/roles';


export const shellRoutes: Routes = [
  { path: 'overview', loadComponent: () => import('./pages/overview/overview').then(m => m.OverviewComponent) },
  {
    path: 'system-admin',
    canActivate: [roleGuard],
    data: { roles: [ROLES.SYSTEM_ADMIN, ROLES.ADMIN] },
    loadChildren: () => import('../system-admin/system-admin.routes').then(m => m.systemAdminRoutes)
  },
  {
    path: 'admin',
    canActivate: [roleGuard],
    data: { roles: [ROLES.ADMIN] },
    loadChildren: () => import('../admin/admin.routes').then(m => m.adminRoutes)
  },
  {
    path: 'inventory',
    canActivate: [roleGuard],
    data: { roles: [ROLES.STOREKEEPER, ROLES.AUDITOR, ROLES.ADMIN] },
    loadChildren: () => import('../inventory/inventory.routes').then(m => m.inventoryRoutes)
  },
  {
    path: 'employee',
    canActivate: [roleGuard],
    data: {
      roles: [
        ROLES.EMPLOYEE,
        ROLES.ADMIN,
        ROLES.STOREKEEPER,
        ROLES.HUMAN_RESOURCE,
        ROLES.AUDITOR,
        ROLES.PROCUREMENT,
        ROLES.SUPERINTENDENT,
        ROLES.ACCOUNTANT,
        ROLES.DIVISION_HEAD,
        ROLES.SYSTEM_ADMIN
      ]
    },
    loadChildren: () => import('../employee/employee.routes').then(m => m.employeeRoutes)
  },
  {
    path: 'hr',
    canActivate: [roleGuard],
    data: { roles: [ROLES.HUMAN_RESOURCE, ROLES.ADMIN] },
    loadChildren: () => import('../hr/hr.routes').then(m => m.hrRoutes)
  },
  {
    path: 'procurement',
    canActivate: [roleGuard],
    data: { roles: [ROLES.PROCUREMENT, ROLES.ADMIN] },
    loadChildren: () => import('../procurement/procurement.routes').then(m => m.procurementRoutes)
  },
  {
    path: 'maintenance',
    canActivate: [roleGuard],
    data: { roles: [ROLES.PROCUREMENT, ROLES.ADMIN] }, // Maintenance is often handled by procurement in this system
    loadChildren: () => import('../maintenance/maintenance.routes').then(m => m.maintenanceRoutes)
  },
  {
    path: 'superintendent',
    canActivate: [roleGuard],
    data: { roles: [ROLES.SUPERINTENDENT, ROLES.ADMIN] },
    loadChildren: () => import('../superintendent/superintendent.routes').then(m => m.superintendentRoutes)
  },
  {
    path: 'approvals',
    canActivate: [roleGuard],
    data: { roles: [ROLES.DIVISION_HEAD] },
    loadChildren: () => import('../approvals/approvals.routes').then(m => m.approvalsRoutes)
  },
  {
    path: 'reporting',
    canActivate: [roleGuard],
    data: { roles: [ROLES.AUDITOR, ROLES.ADMIN] },
    loadChildren: () => import('../reporting/reporting.routes').then(m => m.reportingRoutes)
  },
  { path: '', redirectTo: 'overview', pathMatch: 'full' },
];
