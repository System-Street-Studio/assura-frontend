import { Component, inject, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { AppNotification, NotificationService } from '../../../../shared/services/notification.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { ProfileService } from '../../../../core/services/profile.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  private notifService = inject(NotificationService);
  private router = inject(Router);
  private elRef = inject(ElementRef);
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);

  get employeeName(): string {
    const profile = this.profileService.profile();
    return profile ? `${profile.firstName} ${profile.lastName}` : 'User';
  }

  get initials(): string {
    const profile = this.profileService.profile();
    if (!profile) return 'U';
    return (profile.firstName[0] || '') + (profile.lastName[0] || '');
  }

  get roleName(): string {
    const currentUrl = this.router.url;
    const sections: { [key: string]: string } = {
      'admin': 'Admin',
      'procurement': 'Procurement',
      'inventory': 'Inventory',
      'hr': 'HR',
      'accountant': 'Accountant',
      'reporting': 'Reporting',
      'superintendent': 'Superintendent',
      'approvals': 'Division Head',
      'employee': 'Employee',
    };
    const activeSectionKey = Object.keys(sections).find(s => currentUrl.startsWith(`/${s}`));
    if (activeSectionKey) return sections[activeSectionKey];
    const role = this.authService.getRole();
    return (typeof role === 'string' ? role : null) ?? 'Dashboard';
  }

  notifications: AppNotification[] = [];
  unreadCount = 0;
  showNotifPanel = false;
  showProfileMenu = false;

  private subs: Subscription[] = [];

  ngOnInit(): void {
    this.subs.push(
      this.notifService.getAll().subscribe((n: AppNotification[]) => (this.notifications = n)),
      this.notifService.getUnreadCount().subscribe((c: number) => (this.unreadCount = c))
    );

    // Load profile if not already cached
    if (!this.profileService.profile()) {
      this.profileService.getProfile().subscribe();
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.showNotifPanel = false;
      this.showProfileMenu = false;
    }
  }

  toggleNotifications(): void {
    this.showNotifPanel = !this.showNotifPanel;
    this.showProfileMenu = false;
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
    this.showNotifPanel = false;
  }

  markAsRead(notif: AppNotification): void {
    if (!notif.read) {
      this.notifService.markAsRead(notif.id);
    }
  }

  markAllRead(): void {
    this.notifService.markAllAsRead();
  }

  getTimeAgo(date: Date): string {
    return this.notifService.formatTimeAgo(date);
  }

  onProfile(): void {
    this.showProfileMenu = false;
    this.router.navigate(['/profile']);
  }

  onSettings(): void {
    this.showProfileMenu = false;
    this.router.navigate(['/settings']);
  }

  onLogout(): void {
    this.showProfileMenu = false;
    this.authService.logout();
    this.profileService.clearCache();
    this.router.navigate(['/auth/login']);
  }
}
