import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ProfileService } from '../../../core/services/profile.service';
import { UserWorkspace } from '../../../features/profile/models/profile.models';
import { NotificationService, AppNotification } from '../../services/notification.service';
import { Observable } from 'rxjs';

export interface WorkspaceOption {
  id: string;
  role: string;
  label: string;
  divisionId?: number;
  divisionName?: string;
  icon: string;
  dashboardUrl: string;
  section: string;
}

const ROLE_DEFINITIONS: Record<string, { label: string; icon: string; dashboardUrl: string; section: string }> = {
  Employee: {
    label: 'Employee Portal',
    icon: 'badge',
    dashboardUrl: '/employee/employee-overview',
    section: 'employee'
  },
  DivisionHead: {
    label: 'Division Head',
    icon: 'fact_check',
    dashboardUrl: '/approvals/overview',
    section: 'approvals'
  },
  Storekeeper: {
    label: 'Storekeeper',
    icon: 'inventory_2',
    dashboardUrl: '/inventory/dashboard',
    section: 'inventory'
  },
  Procurement: {
    label: 'Procurement',
    icon: 'shopping_bag',
    dashboardUrl: '/procurement/overview',
    section: 'procurement'
  },
  Admin: {
    label: 'Administrator',
    icon: 'shield',
    dashboardUrl: '/admin/overview',
    section: 'admin'
  },
  SystemAdmin: {
    label: 'System Admin',
    icon: 'admin_panel_settings',
    dashboardUrl: '/system-admin/overview',
    section: 'system-admin'
  },
  HR: {
    label: 'Human Resources',
    icon: 'groups',
    dashboardUrl: '/hr/overview',
    section: 'hr'
  },
  Accountant: {
    label: 'Accountant',
    icon: 'account_balance',
    dashboardUrl: '/accountant/overview',
    section: 'accountant'
  },
  Auditor: {
    label: 'Auditor',
    icon: 'assessment',
    dashboardUrl: '/reporting/dashboard',
    section: 'reporting'
  },
  Superintendent: {
    label: 'Superintendent',
    icon: 'supervised_user_circle',
    dashboardUrl: '/superintendent/overview',
    section: 'superintendent'
  }
};

@Component({
  selector: 'app-shared-navbar',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class SharedNavbarComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  public notificationService = inject(NotificationService);

  showProfileMenu = false;
  showNotificationMenu = false;
  showRoleMenu = false;
  isSwitching = false;

  notifications$ = this.notificationService.getAll();
  unreadCount$ = this.notificationService.getUnreadCount();

  ngOnInit(): void {
    if (!this.profileService.profile()) {
      this.profileService.getProfile().subscribe({ error: () => {} });
    }
  }

  get userInitials(): string {
    const firstName = this.authService.getFirstName() || 'U';
    return firstName.charAt(0).toUpperCase();
  }

  get availableWorkspaces(): WorkspaceOption[] {
    const profile = this.profileService.profile();
    const rawWorkspaces = profile?.workspaces;

    if (rawWorkspaces && rawWorkspaces.length > 0) {
      return rawWorkspaces.map((w: UserWorkspace, index: number) => {
        const def = ROLE_DEFINITIONS[w.role] || {
          label: w.role,
          icon: 'badge',
          dashboardUrl: '/overview',
          section: w.role.toLowerCase()
        };

        return {
          id: `${w.role}-${w.divisionId ?? index}`,
          role: w.role,
          label: def.label,
          divisionId: w.divisionId,
          divisionName: w.divisionName,
          icon: def.icon,
          dashboardUrl: def.dashboardUrl,
          section: def.section
        };
      });
    }

    // Fallback: construct from token roles and division
    const rawRoles = this.authService.getRoles();
    const currentDivisionId = this.authService.getDivisionId() ?? undefined;
    const currentDivisionName = profile?.divisionName;
    const roleKeys = new Set<string>();

    for (const r of rawRoles) {
      if (!r || r === 'Pending') continue;
      const match = Object.keys(ROLE_DEFINITIONS).find(k => k.toLowerCase() === r.toLowerCase());
      if (match) {
        roleKeys.add(match);
      }
    }


    return Array.from(roleKeys).map(key => ({
      id: `${key}-${currentDivisionId ?? 0}`,
      role: key,
      label: ROLE_DEFINITIONS[key]?.label || key,
      divisionId: currentDivisionId,
      divisionName: currentDivisionName,
      icon: ROLE_DEFINITIONS[key]?.icon || 'badge',
      dashboardUrl: ROLE_DEFINITIONS[key]?.dashboardUrl || '/overview',
      section: ROLE_DEFINITIONS[key]?.section || key.toLowerCase()
    }));
  }

  get hasMultipleWorkspaces(): boolean {
    return this.availableWorkspaces.length > 1;
  }

  get activeWorkspace(): WorkspaceOption | null {
    const currentUrl = this.router.url;
    const currentDivisionId = this.authService.getDivisionId();
    const workspaces = this.availableWorkspaces;
    if (workspaces.length === 0) return null;

    // 1. Try matching current URL section AND divisionId
    const bySectionAndDivision = workspaces.find(w =>
      currentUrl.startsWith(`/${w.section}`) &&
      (!w.divisionId || w.divisionId === currentDivisionId)
    );
    if (bySectionAndDivision) return bySectionAndDivision;

    // 2. Try matching current URL section only
    const bySection = workspaces.find(w => currentUrl.startsWith(`/${w.section}`));
    if (bySection) return bySection;

    // 3. Try matching ActiveRole from token (if set during context switch) & division
    const activeRole = this.authService.getActiveRole();
    if (activeRole) {
      const byActiveRoleAndDiv = workspaces.find(w =>
        w.role.toLowerCase() === activeRole.toLowerCase() &&
        (!w.divisionId || w.divisionId === currentDivisionId)
      );
      if (byActiveRoleAndDiv) return byActiveRoleAndDiv;

      const byActiveRole = workspaces.find(w =>
        w.role.toLowerCase() === activeRole.toLowerCase()
      );
      if (byActiveRole) return byActiveRole;
    }

    // 4. Try matching primary role & division
    const primary = this.authService.getRole();
    if (primary) {
      const byPrimary = workspaces.find(w =>
        w.role.toLowerCase() === primary.toLowerCase() &&
        (!w.divisionId || w.divisionId === currentDivisionId)
      );
      if (byPrimary) return byPrimary;

      const byPrimaryOnly = workspaces.find(w =>
        w.role.toLowerCase() === primary.toLowerCase()
      );
      if (byPrimaryOnly) return byPrimaryOnly;
    }

    return workspaces[0];
  }

  get pageTitle(): string {
    const currentUrl = this.router.url;
    const titles: Record<string, string> = {
      '/reporting/dashboard': 'Dashboard',
      '/admin': 'Dashboard',
      '/inventory': 'Dashboard',
      '/procurement': 'Overview',
      '/employee': 'Dashboard',
      '/approvals': 'Approvals',
      '/hr': 'Human Resources',
      '/accountant': 'Accounts',
      '/superintendent': 'Superintendent',
      '/system-admin': 'System Admin',
    };

    const match = Object.keys(titles).find((path) => currentUrl.startsWith(path));
    return match ? titles[match] : 'Dashboard';
  }

  @HostListener('document:click')
  closeMenu(): void {
    this.showProfileMenu = false;
    this.showNotificationMenu = false;
    this.showRoleMenu = false;
  }

  toggleRoleMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.showRoleMenu = !this.showRoleMenu;
    this.showProfileMenu = false;
    this.showNotificationMenu = false;
  }

  switchWorkspace(workspace: WorkspaceOption, event: MouseEvent): void {
    event.stopPropagation();
    this.showRoleMenu = false;

    // If already in this exact workspace context, just navigate
    if (this.activeWorkspace?.id === workspace.id) {
      this.router.navigateByUrl(workspace.dashboardUrl);
      return;
    }

    this.isSwitching = true;
    this.authService.switchContext({
      divisionId: workspace.divisionId,
      role: workspace.role
    }).subscribe({
      next: () => {
        this.isSwitching = false;
        localStorage.setItem('lastActiveSection', workspace.section);
        // Refresh cached profile with new active division
        this.profileService.getProfile(true).subscribe();

        // Navigate cleanly to target dashboard
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigateByUrl(workspace.dashboardUrl);
        });
      },
      error: (err) => {
        this.isSwitching = false;
        console.error('Failed to switch workspace context:', err);
        localStorage.setItem('lastActiveSection', workspace.section);
        this.router.navigateByUrl(workspace.dashboardUrl);
      }
    });
  }

  toggleProfileMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.showProfileMenu = !this.showProfileMenu;
    this.showNotificationMenu = false;
    this.showRoleMenu = false;
  }

  toggleNotificationMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.showNotificationMenu = !this.showNotificationMenu;
    this.showProfileMenu = false;
    this.showRoleMenu = false;
  }

  handleNotificationClick(note: AppNotification, event: MouseEvent): void {
    event.stopPropagation();
    this.notificationService.markAsRead(note.id);
    this.showNotificationMenu = false;

    const role = this.authService.getRole()?.toLowerCase() || '';
    const title = note.title.toLowerCase();

    let targetUrl = '';

    if (title.includes('arrival') || title.includes('received')) {
      if (role === 'procurement') {
        targetUrl = '/procurement/new-arrivals';
      } else if (role === 'storekeeper') {
        targetUrl = '/inventory/informed-arrivals';
      } else if (role === 'employee') {
        targetUrl = '/employee/all-emp-requests';
      } else if (role === 'divisionhead' || role === 'division head') {
        targetUrl = '/approvals/requests';
      } else {
        targetUrl = `/${role}/dashboard`;
      }
    } else if (title.includes('request') || title.includes('assigned') || title.includes('reserved') || title.includes('approval')) {
      if (role === 'employee') {
        targetUrl = '/employee/all-emp-requests';
      } else if (role === 'divisionhead' || role === 'division head' || role === 'inventorymanager' || role === 'inventory manager') {
        targetUrl = '/approvals/requests';
      } else {
        targetUrl = `/${role}/requests`;
      }
    } else if (title.includes('discard')) {
      if (role === 'superintendent') targetUrl = '/superintendent/discarded-notes';
      else if (role === 'accountant') targetUrl = '/accountant/discard-note';
      else targetUrl = `/${role}/discarded-notes`;
    }

    if (targetUrl) {
      this.router.navigate([targetUrl]);
    }
  }

  markAllAsRead(event: MouseEvent): void {
    event.stopPropagation();
    this.notificationService.markAllAsRead();
  }

  openProfile(): void {
    this.showProfileMenu = false;
    this.router.navigate(['/profile']);
  }

  logout(): void {
    this.showProfileMenu = false;
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
