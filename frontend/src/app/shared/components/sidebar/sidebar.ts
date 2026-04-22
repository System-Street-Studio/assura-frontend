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
    { label: 'Dashboard', icon: 'dashboard', link: '/reporting/dashboard', roles: ['Auditor', 'Admin'] },
    { label: 'Asset', icon: 'inventory_2', link: '/inventory/assets', roles: ['Storekeeper', 'Auditor', 'Admin'] },
    { label: 'Report', icon: 'assessment', link: '/reporting/reports', roles: ['Auditor', 'Admin'] },
    { label: 'Audit log', icon: 'policy', link: '/reporting/audit-logs', roles: ['Auditor', 'Admin'] },
    { label: 'Check out', icon: 'logout', link: '/reporting/export', roles: ['Auditor', 'Admin'] },
  ];

  get filteredMenuItems(): SharedSidebarItem[] {
    const roles = this.authService.getRoles();
    const section = this.router.url.split('/')[1];

    return this.menuItems.filter((item) => {
      const canView =
        section === 'reporting' && roles.length === 0
          ? item.roles.includes('Auditor')
          : roles.some((role) => item.roles.includes(role));
      return canView && item.link.startsWith(`/${section}`);
    });
  }
}
