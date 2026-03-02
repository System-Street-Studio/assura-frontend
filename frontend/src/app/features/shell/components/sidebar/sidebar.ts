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
    { label: 'Dashboard', icon: 'home', link: '/admin/overview', roles: ['ADMIN'], section: 'admin' },
    { label: 'My Assets', icon: 'inventory_2', link: '/admin/my-assets', roles: ['ADMIN'], section: 'admin' },
    { label: 'Track Assets', icon: 'track_changes', link: '/admin/track-assets', roles: ['ADMIN'], section: 'admin' },

    // Procurement section
    { label: 'Overview', icon: 'home', link: '/procurement/overview', roles: ['PROCUREMENT', 'ADMIN'], section: 'procurement' },
    { label: 'PO', icon: 'receipt_long', link: '/procurement/purchase-orders', roles: ['PROCUREMENT', 'ADMIN'], section: 'procurement' },
    { label: 'Suppliers', icon: 'local_shipping', link: '/procurement/suppliers', roles: ['PROCUREMENT', 'ADMIN'], section: 'procurement' },
    { label: 'Maintenance', icon: 'build', link: '/procurement/maintenance', roles: ['PROCUREMENT', 'ADMIN'], section: 'procurement' },
    { label: 'New Arrivals', icon: 'fiber_new', link: '/procurement/new-arrivals', roles: ['PROCUREMENT', 'ADMIN'], section: 'procurement' },

    // Inventory / Storekeeper section
    { label: 'Assets', icon: 'inventory_2', link: '/inventory/assets', roles: ['STOREKEEPER', 'AUDITOR', 'ADMIN'], section: 'inventory' },
    { label: 'Products', icon: 'category', link: '/inventory/products', roles: ['STOREKEEPER', 'ADMIN'], section: 'inventory' },
    { label: 'Check In', icon: 'check_circle', link: '/inventory/check-in', roles: ['STOREKEEPER', 'ADMIN'], section: 'inventory' },
    { label: 'Check Out', icon: 'exit_to_app', link: '/inventory/check-out', roles: ['STOREKEEPER', 'AUDITOR', 'ADMIN'], section: 'inventory' },
    { label: 'Assets Requests', icon: 'assignment', link: '/inventory/assets-requests', roles: ['STOREKEEPER', 'ADMIN'], section: 'inventory' },

    // HR section
    { label: 'Pending', icon: 'pending_actions', link: '/hr/pending', roles: ['HR', 'ADMIN'], section: 'hr' },
    { label: 'Assigned', icon: 'group', link: '/hr/assigned', roles: ['HR', 'ADMIN'], section: 'hr' },

    // Accountant section
    { label: 'Discarded', icon: 'cancel', link: '/accountant/discarded', roles: ['ACCOUNTANT', 'ADMIN'], section: 'accountant' },

    // Reporting / Auditor section
    { label: 'Reports', icon: 'assessment', link: '/reporting/reports', roles: ['AUDITOR', 'ADMIN'], section: 'reporting' },
    { label: 'Audit Logs', icon: 'policy', link: '/reporting/audit-logs', roles: ['AUDITOR', 'ADMIN'], section: 'reporting' },
    { label: 'Export', icon: 'file_download', link: '/reporting/export', roles: ['AUDITOR', 'ADMIN'], section: 'reporting' },

    // Superintendent section
    { label: 'Discarded Notes', icon: 'note_alt', link: '/superintendent/discarded-notes', roles: ['SUPERINTENDENT', 'ADMIN'], section: 'superintendent' },

    // Common / General
    { label: 'Global Overview', icon: 'dashboard', link: '/overview', roles: ['ANY'], section: 'general' }
  ];

  get filteredMenuItems(): MenuItem[] {
    const userRoles = this.getUserRoles();
    const currentUrl = this.router.url;

    // 1. Identify current active section from URL
    const sections = ['admin', 'procurement', 'inventory', 'hr', 'accountant', 'reporting', 'superintendent'];
    const activeSection = sections.find(s => currentUrl.startsWith(`/${s}`));

    // 2. Filter by role
    let filtered = this.menuItems.filter(item =>
      item.roles.includes('ANY') ||
      userRoles.some(role => item.roles.includes(role))
    );

    // 3. Filter by active section if we are in one
    if (activeSection) {
      filtered = filtered.filter(item => item.section === activeSection);
    } else {
      // If on root/overview, show general items or items matching user's primary role section
      filtered = filtered.filter(item => item.section === 'general' || !item.section);
    }

    return filtered;
  }

  private getUserRoles(): string[] {
    const rawRole = this.authService.getRole();
    const roles: string[] = [];
    if (Array.isArray(rawRole)) {
      roles.push(...rawRole.map(r => r.toUpperCase()));
    } else if (typeof rawRole === 'string') {
      if (rawRole.includes(',')) {
        roles.push(...rawRole.split(',').map(r => r.trim().toUpperCase()));
      } else {
        roles.push(rawRole.toUpperCase());
      }
    }
    return roles;
  }

  isCollapsed = false;

  toggleMenu() {
    this.isCollapsed = !this.isCollapsed;
  }
}
