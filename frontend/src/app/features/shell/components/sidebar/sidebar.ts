import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
})
export class SidebarComponent {
  menuItems = [
    // Common
    { label: 'Overview', icon: 'home', link: 'employee/employee-overview', roles: ['ANY'] },

    // Employee
    { label: 'My Assets', icon: 'description', link: 'employee/employee-assets', roles: ['ANY'] },
     { label: 'My Requests', icon: 'assignment', link: 'employee/requests-main', roles: ['ANY'] },

    // Storekeeper-heavy items
    /*{
      label: 'Assets',
      icon: 'inventory_2',
      link: 'assets',
      roles: ['STOREKEEPER', 'AUDITOR', 'ADMIN'],
    },
    { label: 'Products', icon: 'category', link: 'products', roles: ['STOREKEEPER', 'ADMIN'] },
    {
      label: 'Suppliers',
      icon: 'local_shipping',
      link: 'suppliers',
      roles: ['PROCUREMENT', 'STOREKEEPER', 'ADMIN'],
    },
    { label: 'PO', icon: 'receipt_long', link: 'purchase-orders', roles: ['PROCUREMENT', 'ADMIN'] },
    { label: 'Check In', icon: 'check_circle', link: 'check-in', roles: ['STOREKEEPER', 'ADMIN'] },
    {
      label: 'Check Out',
      icon: 'exit_to_app',
      link: 'check-out',
      roles: ['STOREKEEPER', 'AUDITOR', 'ADMIN'],
    },
    {
      label: 'Maintenance',
      icon: 'build',
      link: 'maintenance',
      roles: ['PROCUREMENT', 'STOREKEEPER', 'ADMIN'],
    },
    {
      label: 'Assets Requests',
      icon: 'assignment',
      link: 'assets-requests',
      roles: ['STOREKEEPER', 'ADMIN'],
    },

    // Admin
    { label: 'Track Assets', icon: 'track_changes', link: 'track-assets', roles: ['ADMIN'] },

    // HR
    { label: 'Pending', icon: 'pending_actions', link: 'pending', roles: ['HR'] },
    { label: 'Assigned', icon: 'group', link: 'assigned', roles: ['HR'] },

    // Accountant
    { label: 'Discarded', icon: 'cancel', link: 'discarded', roles: ['ACCOUNTANT'] },

    // Auditor
    { label: 'Reports', icon: 'assessment', link: 'reports', roles: ['AUDITOR'] },
    { label: 'Audit Logs', icon: 'policy', link: 'audit-logs', roles: ['AUDITOR'] },
    { label: 'Export', icon: 'file_download', link: 'export', roles: ['AUDITOR'] },

    // Superintendent
    {
      label: 'Discarded Notes',
      icon: 'note_alt',
      link: 'discarded-notes',
      roles: ['SUPERINTENDENT'],
    },*/
  ];

  isCollapsed = false;

  toggleMenu() {
    this.isCollapsed = !this.isCollapsed;
  }
}
