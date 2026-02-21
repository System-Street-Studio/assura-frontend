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
    // Common — absolute paths so they work from any active route
    { label: 'Overview', icon: 'home', link: '/procurement/overview', roles: ['ANY'] },
    { label: 'My Assets', icon: 'description', link: '/my-assets', roles: ['ANY'] },

    // Storekeeper-heavy items
    { label: 'Assets', icon: 'inventory_2', link: '/inventory/assets', roles: ['STOREKEEPER', 'AUDITOR', 'ADMIN'] },
    { label: 'Products', icon: 'category', link: '/inventory/products', roles: ['STOREKEEPER', 'ADMIN'] },
    { label: 'Suppliers', icon: 'local_shipping', link: '/procurement/suppliers', roles: ['PROCUREMENT', 'STOREKEEPER', 'ADMIN'] },
    { label: 'PO', icon: 'receipt_long', link: '/procurement/purchase-orders', roles: ['PROCUREMENT', 'ADMIN'] },
    { label: 'Check In', icon: 'check_circle', link: '/inventory/check-in', roles: ['STOREKEEPER', 'ADMIN'] },
    { label: 'Check Out', icon: 'exit_to_app', link: '/inventory/check-out', roles: ['STOREKEEPER', 'AUDITOR', 'ADMIN'] },
    { label: 'Maintenance', icon: 'build', link: '/procurement/maintenance', roles: ['PROCUREMENT', 'STOREKEEPER', 'ADMIN'] },
    { label: 'Assets Requests', icon: 'assignment', link: '/inventory/assets-requests', roles: ['STOREKEEPER', 'ADMIN'] },

    // Admin
    { label: 'Track Assets', icon: 'track_changes', link: '/inventory/track-assets', roles: ['ADMIN'] },

    // HR
    { label: 'Pending', icon: 'pending_actions', link: '/hr/pending', roles: ['HR'] },
    { label: 'Assigned', icon: 'group', link: '/hr/assigned', roles: ['HR'] },

    // Accountant
    { label: 'Discarded', icon: 'cancel', link: '/accountant/discarded', roles: ['ACCOUNTANT'] },

    // Auditor
    { label: 'Reports', icon: 'assessment', link: '/reporting/reports', roles: ['AUDITOR'] },
    { label: 'Audit Logs', icon: 'policy', link: '/reporting/audit-logs', roles: ['AUDITOR'] },
    { label: 'Export', icon: 'file_download', link: '/reporting/export', roles: ['AUDITOR'] },

    // Superintendent
    { label: 'Discarded Notes', icon: 'note_alt', link: '/superintendent/discarded-notes', roles: ['SUPERINTENDENT'] },

    // Procurement
    { label: 'New Arrivals', icon: 'new_releases', link: '/procurement/new-arrivals', roles: ['PROCUREMENT'] },
  ];

  get filteredMenuItems(): MenuItem[] {
    const allRoles = this.authService.getRoles();
    // Use the last role — the most specific one (e.g. 'Procurement' from ['Admin', 'Procurement'])
    const primaryRole = allRoles.length > 0
      ? allRoles[allRoles.length - 1].toUpperCase()
      : null;
    return this.menuItems.filter(item =>
      item.roles.includes('ANY') ||
      (primaryRole !== null && item.roles.includes(primaryRole))
    );
  }

  isCollapsed = false;

  toggleMenu() {
    this.isCollapsed = !this.isCollapsed;
  }
}
