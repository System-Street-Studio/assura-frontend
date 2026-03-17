import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  link: string;
  roles: string[];
  section?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
})
export class SidebarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  menuItems: MenuItem[] = [
    // Admin section
    { label: 'Dashboard', icon: 'home', link: '/admin/overview', roles: ['Admin'], section: 'admin' },
    { label: 'My Assets', icon: 'inventory_2', link: '/admin/my-assets', roles: ['Admin'], section: 'admin' },
    { label: 'Track Assets', icon: 'track_changes', link: '/admin/track-assets', roles: ['Admin'], section: 'admin' },

    // Procurement section
    { label: 'Overview', icon: 'home', link: '/procurement/overview', roles: ['Procurement', 'Admin'], section: 'procurement' },
    { label: 'My Assets', icon: 'inventory_2', link: '/procurement/my-assets', roles: ['Procurement', 'Admin'], section: 'procurement' },
    { label: 'PO', icon: 'receipt_long', link: '/procurement/purchase-orders', roles: ['Procurement', 'Admin'], section: 'procurement' },
    { label: 'Suppliers', icon: 'local_shipping', link: '/procurement/suppliers', roles: ['Procurement', 'Admin'], section: 'procurement' },
    { label: 'Maintenance', icon: 'build', link: '/procurement/maintenance', roles: ['Procurement', 'Admin'], section: 'procurement' },
    { label: 'New Arrivals', icon: 'fiber_new', link: '/procurement/new-arrivals', roles: ['Procurement', 'Admin'], section: 'procurement' },

    // Inventory / Storekeeper section
    { label: 'Assets', icon: 'inventory_2', link: '/inventory/assets', roles: ['Storekeeper', 'Auditor', 'Admin'], section: 'inventory' },
    { label: 'Products', icon: 'category', link: '/inventory/products', roles: ['Storekeeper', 'Admin'], section: 'inventory' },
    { label: 'Check In', icon: 'check_circle', link: '/inventory/check-in', roles: ['Storekeeper', 'Admin'], section: 'inventory' },
    { label: 'Check Out', icon: 'exit_to_app', link: '/inventory/check-out', roles: ['Storekeeper', 'Auditor', 'Admin'], section: 'inventory' },
    { label: 'Assets Requests', icon: 'assignment', link: '/inventory/assets-requests', roles: ['Storekeeper', 'Admin'], section: 'inventory' },

    // HR section
    { label: 'Pending', icon: 'pending_actions', link: '/hr/pending', roles: ['HR', 'Admin'], section: 'hr' },
    { label: 'Assigned', icon: 'group', link: '/hr/assigned', roles: ['HR', 'Admin'], section: 'hr' },

    // Accountant section
    { label: 'Discarded', icon: 'cancel', link: '/accountant/discarded', roles: ['Accountant', 'Admin'], section: 'accountant' },

    // Reporting / Auditor section
    { label: 'Reports', icon: 'assessment', link: '/reporting/reports', roles: ['Auditor', 'Admin'], section: 'reporting' },
    { label: 'Audit Logs', icon: 'policy', link: '/reporting/audit-logs', roles: ['Auditor', 'Admin'], section: 'reporting' },
    { label: 'Export', icon: 'file_download', link: '/reporting/export', roles: ['Auditor', 'Admin'], section: 'reporting' },

    // Superintendent section
    { label: 'Overview', icon: 'home', link: '/superintendent/overview', roles: ['Superintendent', 'Admin'], section: 'superintendent' },
    { label: 'My Assets', icon: 'inventory_2', link: '/superintendent/my-assets', roles: ['Superintendent', 'Admin'], section: 'superintendent' },
    { label: 'Discarded Notes', icon: 'note_alt', link: '/superintendent/discarded-notes', roles: ['Superintendent', 'Admin'], section: 'superintendent' },
    { label: 'Buyer', icon: 'shopping_cart', link: '/superintendent/buyer', roles: ['Superintendent', 'Admin'], section: 'superintendent' },

    // Approvals / Division Head section
    { label: 'Overview', icon: 'home', link: '/approvals/overview', roles: ['Division Head', 'Admin'], section: 'approvals' },
    { label: 'Assets', icon: 'inventory', link: '/approvals/assets', roles: ['Division Head', 'Admin'], section: 'approvals' },
    { label: 'Requests', icon: 'request_quote', link: '/approvals/requests', roles: ['Division Head', 'Admin'], section: 'approvals' },
    { label: 'Transfers', icon: 'transfer_within_a_station', link: '/approvals/transfers', roles: ['Division Head', 'Admin'], section: 'approvals' },
  ];

  get filteredMenuItems(): MenuItem[] {
    const userRoles = this.getUserRoles();
    const currentUrl = this.router.url;

    // Identify current active section from URL
    const sections = ['admin', 'procurement', 'inventory', 'hr', 'accountant', 'reporting', 'superintendent', 'approvals'];
    const activeSection = sections.find(s => currentUrl.startsWith(`/${s}`));

    // Filter by role
    let filtered = this.menuItems.filter(item =>
      item.roles.includes('ANY') ||
      userRoles.some(role => item.roles.includes(role))
    );

    // Filter by active section if we are in one
    if (activeSection) {
      filtered = filtered.filter(item => item.section === activeSection);
    }

    return filtered;
  }

  private getUserRoles(): string[] {
    // TODO: REMOVE THIS BYPASS — FOR TESTING ONLY
    const url = this.router.url;
    if (url.startsWith('/admin')) return ['Admin'];
    if (url.startsWith('/procurement')) return ['Procurement', 'Admin'];
    if (url.startsWith('/inventory')) return ['Storekeeper', 'Admin'];
    if (url.startsWith('/hr')) return ['HR', 'Admin'];
    if (url.startsWith('/accountant')) return ['Accountant', 'Admin'];
    if (url.startsWith('/reporting')) return ['Auditor', 'Admin'];
    if (url.startsWith('/superintendent')) return ['Superintendent', 'Admin'];
    if (url.startsWith('/approvals')) return ['Division Head', 'Admin'];
    if (url.startsWith('/employee')) return ['Employee'];
    return ['Admin']; // default fallback
  }

  isCollapsed = false;

  toggleMenu() {
    this.isCollapsed = !this.isCollapsed;
  }
}
