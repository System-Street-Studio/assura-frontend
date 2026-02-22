import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
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
  menuItems: NavItem[] = [
    // Storekeeper nav
    { label: 'Dashboard', icon: 'grid_view', link: 'inventory/dashboard', roles: ['STOREKEEPER', 'ADMIN'] },
    { label: 'Asset', icon: 'precision_manufacturing', link: 'inventory/assets', roles: ['STOREKEEPER', 'AUDITOR', 'ADMIN'] },
    { label: 'products', icon: 'inventory_2', link: 'inventory/products', roles: ['STOREKEEPER', 'ADMIN'] },
    { label: 'suppliers', icon: 'local_shipping', link: 'inventory/suppliers', roles: ['PROCUREMENT', 'STOREKEEPER', 'ADMIN'] },
    { label: 'request list', icon: 'swap_horiz', link: 'inventory/asset-requests', roles: ['STOREKEEPER', 'ADMIN'] },
    { label: 'Check out', icon: 'exit_to_app', link: 'inventory/check-out', roles: ['STOREKEEPER', 'AUDITOR', 'ADMIN'] },
    { label: 'Check in', icon: 'login', link: 'inventory/check-in', roles: ['STOREKEEPER', 'ADMIN'] },
    { label: 'Maintenance', icon: 'build', link: 'inventory/maintenance', roles: ['PROCUREMENT', 'STOREKEEPER', 'ADMIN'] },
  ];

  bottomLinks = [
    { label: 'Settings', icon: 'settings', link: 'settings' },
    { label: 'Profile', icon: 'account_circle', link: 'profile' },
  ];

  isCollapsed = false;

  constructor() {
    this.updateCollapsedState();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateCollapsedState();
  }

  toggleMenu(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  private updateCollapsedState(): void {
    this.isCollapsed = window.innerWidth < 480;
  }
}
