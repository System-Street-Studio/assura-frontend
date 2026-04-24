import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

interface SharedSidebarItem {
  label: string;
  icon: string;
  link: string;
  roles: string[];
  isGlobal?: boolean;
  section?: string;
}

@Component({
  selector: 'app-shared-sidebar',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
})
export class SharedSidebarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly menuItems: SharedSidebarItem[] = [
    // Admin section
    { label: 'Admin Dashboard', icon: 'home', link: '/admin/overview', roles: ['Admin'] },
    { label: 'Track Assets', icon: 'track_changes', link: '/admin/track-assets', roles: ['Admin'] },

    // Procurement section
    { label: 'Overview', icon: 'home', link: '/procurement/overview', roles: ['Procurement', 'Admin'] },
    { label: 'PO', icon: 'receipt_long', link: '/procurement/purchase-orders', roles: ['Procurement', 'Admin'] },
    { label: 'Suppliers', icon: 'local_shipping', link: '/procurement/suppliers', roles: ['Procurement', 'Admin'] },
    { label: 'Maintenance', icon: 'build', link: '/procurement/maintenance', roles: ['Procurement', 'Admin'] },
    { label: 'New Arrivals', icon: 'fiber_new', link: '/procurement/new-arrivals', roles: ['Procurement', 'Admin'] },

    // Inventory / Storekeeper section
    { label: 'Dashboard', icon: 'grid_view', link: '/inventory/dashboard', roles: ['Storekeeper', 'Auditor', 'Admin'] },
    { label: 'Asset', icon: 'precision_manufacturing', link: '/inventory/assets', roles: ['Storekeeper', 'Auditor', 'Admin'] },
    { label: 'Products', icon: 'category', link: '/inventory/products', roles: ['Storekeeper', 'Admin'] },
    { label: 'New Arrivals', icon: 'fiber_new', link: '/inventory/informed-arrivals', roles: ['Storekeeper', 'Admin'] },
    { label: 'Request List', icon: 'swap_horiz', link: '/inventory/asset-requests', roles: ['Storekeeper', 'Admin'] },
    { label: 'Check Out', icon: 'exit_to_app', link: '/inventory/check-out', roles: ['Storekeeper', 'Auditor', 'Admin'] },
    { label: 'Check In', icon: 'login', link: '/inventory/check-in', roles: ['Storekeeper', 'Admin'] },
    { label: 'Maintenance', icon: 'build', link: '/inventory/maintenance', roles: ['Procurement', 'Storekeeper', 'Admin'] },

    // HR section
    { label: 'Overview', icon: 'home', link: '/hr/overview', roles: ['HR', 'Admin'] },
    { label: 'My Assets', icon: 'inventory_2', link: '/hr/my-assets', roles: ['HR', 'Admin'] },
    { label: 'Pending', icon: 'pending_actions', link: '/hr/pending', roles: ['HR', 'Admin'] },
    { label: 'Assigned', icon: 'group', link: '/hr/assigned', roles: ['HR', 'Admin'] },

    // Accountant section
    { label: 'Discarded', icon: 'cancel', link: '/accountant/discarded', roles: ['Accountant', 'Admin'] },

    // Reporting / Auditor section
    { label: 'Dashboard', icon: 'dashboard', link: '/reporting/dashboard', roles: ['Auditor', 'Admin'] },
    { label: 'Asset', icon: 'inventory_2', link: '/reporting/asset', roles: ['Auditor', 'Admin'] },
    { label: 'Report', icon: 'assessment', link: '/reporting/report', roles: ['Auditor', 'Admin'] },
    { label: 'Audit log', icon: 'policy', link: '/reporting/auditlog', roles: ['Auditor', 'Admin'] },
    { label: 'Check out', icon: 'logout', link: '/reporting/export', roles: ['Auditor', 'Admin'] },

    // Superintendent section
    { label: 'Overview', icon: 'home', link: '/superintendent/overview', roles: ['Superintendent', 'Admin'] },
    { label: 'Discarded Notes', icon: 'note_alt', link: '/superintendent/discarded-notes', roles: ['Superintendent', 'Admin'] },
    { label: 'Buyer', icon: 'shopping_cart', link: '/superintendent/buyer', roles: ['Superintendent', 'Admin'] },

    // Approvals / Division Head section
    { label: 'Overview', icon: 'home', link: '/approvals/overview', roles: ['DivisionHead', 'Admin'] },
    { label: 'Assets', icon: 'inventory', link: '/approvals/assets', roles: ['DivisionHead', 'Admin'] },
    { label: 'Requests', icon: 'request_quote', link: '/approvals/requests', roles: ['DivisionHead', 'Admin'] },
    { label: 'Transfers', icon: 'transfer_within_a_station', link: '/approvals/transfers', roles: ['DivisionHead', 'Admin'] },

    // Employee section
    { label: 'My Dashboard', icon: 'dashboard', link: '/employee/employee-overview', roles: ['ANY'], section: 'employee', isGlobal: true },
    { label: 'My Assets', icon: 'inventory_2', link: '/employee/employee-assets', roles: ['ANY'], section: 'employee', isGlobal: true },
    { label: 'Asset Request', icon: 'add_circle', link: '/employee/requests-main', roles: ['ANY'], section: 'employee', isGlobal: true },
    { label: 'Activity', icon: 'history', link: '/employee/all-emp-requests', roles: ['ANY'], section: 'employee', isGlobal: true },
    { label: 'Transfer', icon: 'swap_horiz', link: '/employee/transfer-page', roles: ['ANY'], section: 'employee', isGlobal: true },
  ];

  get filteredMenuItems(): SharedSidebarItem[] {
    const roles = this.authService.getRoles();
    const currentUrl = this.router.url;

    // Determine the current section from the URL (e.g. '/inventory/assets' -> 'inventory')
    const sectionMatch = currentUrl.match(/^\/([^/]+)/);
    const currentSection = sectionMatch ? sectionMatch[1] : '';

    return this.menuItems.filter((item) => {
      const hasRole = item.roles.includes('ANY') || roles.some((role) => item.roles.includes(role));
      if (!hasRole) return false;

      if (item.isGlobal) return true;

      // Only show items that belong to the current URL section
      return item.link.startsWith(`/${currentSection}`);
    });
  }
}
