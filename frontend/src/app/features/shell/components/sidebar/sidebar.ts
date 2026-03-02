import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  link: string;
  roles: string[];
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

  menuItems: MenuItem[] = [
    // Admin specific items matching screenshot
    { label: 'Dashboard', icon: 'home', link: '/admin/overview', roles: ['ADMIN'] },
    { label: 'My Assets', icon: 'inventory_2', link: '/admin/my-assets', roles: ['ADMIN'] },
    { label: 'Track Assets', icon: 'track_changes', link: '/admin/track-assets', roles: ['ADMIN'] },

    // Common (Existing) - Roles adjusted to exclude ADMIN to avoid duplication
    { label: 'Overview', icon: 'home', link: '/overview', roles: ['PROCUREMENT', 'STOREKEEPER', 'HR', 'ACCOUNTANT', 'AUDITOR', 'SUPERINTENDENT'] },
    { label: 'My Assets', icon: 'description', link: '/my-assets', roles: ['PROCUREMENT', 'STOREKEEPER', 'HR', 'ACCOUNTANT', 'AUDITOR', 'SUPERINTENDENT'] },

    // Storekeeper-heavy items (Adjusted roles to exclude ADMIN where appropriate)
    {
      label: 'Assets',
      icon: 'inventory_2',
      link: '/assets',
      roles: ['STOREKEEPER', 'AUDITOR'],
    },
    { label: 'Products', icon: 'category', link: '/products', roles: ['STOREKEEPER'] },
    {
      label: 'Suppliers',
      icon: 'local_shipping',
      link: '/suppliers',
      roles: ['PROCUREMENT', 'STOREKEEPER'],
    },
    { label: 'PO', icon: 'receipt_long', link: '/purchase-orders', roles: ['PROCUREMENT'] },
    { label: 'Check In', icon: 'check_circle', link: '/check-in', roles: ['STOREKEEPER'] },
    {
      label: 'Check Out',
      icon: 'exit_to_app',
      link: '/check-out',
      roles: ['STOREKEEPER', 'AUDITOR'],
    },
    {
      label: 'Maintenance',
      icon: 'build',
      link: '/maintenance',
      roles: ['PROCUREMENT', 'STOREKEEPER'],
    },
    {
      label: 'Assets Requests',
      icon: 'assignment',
      link: '/assets-requests',
      roles: ['STOREKEEPER'],
    },

    // HR
    { label: 'Pending', icon: 'pending_actions', link: '/pending', roles: ['HR'] },
    { label: 'Assigned', icon: 'group', link: '/assigned', roles: ['HR'] },

    // Accountant
    { label: 'Discarded', icon: 'cancel', link: '/discarded', roles: ['ACCOUNTANT'] },

    // Auditor
    { label: 'Reports', icon: 'assessment', link: '/reports', roles: ['AUDITOR'] },
    { label: 'Audit Logs', icon: 'policy', link: '/audit-logs', roles: ['AUDITOR'] },
    { label: 'Export', icon: 'file_download', link: '/export', roles: ['AUDITOR'] },

    // Superintendent
    {
      label: 'Discarded Notes',
      icon: 'note_alt',
      link: '/discarded-notes',
      roles: ['SUPERINTENDENT'],
    },
  ];

  get filteredMenuItems(): MenuItem[] {
    const rawRole = this.authService.getRole();

    // Handle both single string, array, or comma-separated string from JWT
    const userRoles: string[] = [];
    if (Array.isArray(rawRole)) {
      userRoles.push(...rawRole.map(r => r.toUpperCase()));
    } else if (typeof rawRole === 'string') {
      if (rawRole.includes(',')) {
        userRoles.push(...rawRole.split(',').map(r => r.trim().toUpperCase()));
      } else {
        userRoles.push(rawRole.toUpperCase());
      }
    }

    const filtered = this.menuItems.filter(item =>
      item.roles.includes('ANY') ||
      userRoles.some(role => item.roles.includes(role))
    );

    // If the user is an Admin, show ONLY Admin items (to 'remove everything for procurement')
    if (userRoles.includes('ADMIN')) {
      return filtered.filter(item => item.roles.includes('ADMIN'));
    }

    return filtered;
  }

  isCollapsed = false;

  toggleMenu() {
    this.isCollapsed = !this.isCollapsed;
  }
}
