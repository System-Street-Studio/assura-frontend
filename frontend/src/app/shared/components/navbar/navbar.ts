import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationService, AppNotification } from '../../services/notification.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-shared-navbar',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class SharedNavbarComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  public notificationService = inject(NotificationService);

  showProfileMenu = false;
  showNotificationMenu = false;

  notifications$ = this.notificationService.getAll();
  unreadCount$ = this.notificationService.getUnreadCount();

  get pageTitle(): string {
    const currentUrl = this.router.url;
    const titles: Record<string, string> = {
      '/reporting/dashboard': 'Dashboard',
      '/admin': 'Dashboard',
      '/inventory': 'Dashboard',
      '/procurement': 'Overview',
      '/employee': 'Dashboard',
    };

    const match = Object.keys(titles).find((path) => currentUrl.startsWith(path));
    return match ? titles[match] : 'Dashboard';
  }

  @HostListener('document:click')
  closeMenu(): void {
    this.showProfileMenu = false;
    this.showNotificationMenu = false;
  }

  toggleProfileMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.showProfileMenu = !this.showProfileMenu;
    this.showNotificationMenu = false;
  }

  toggleNotificationMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.showNotificationMenu = !this.showNotificationMenu;
    this.showProfileMenu = false;
  }

  handleNotificationClick(note: AppNotification, event: MouseEvent): void {
    event.stopPropagation();
    this.notificationService.markAsRead(note.id);
    this.showNotificationMenu = false;

    const role = this.authService.getRole()?.toLowerCase() || '';
    const title = note.title.toLowerCase();

    let targetUrl = '';

    if (title.includes('arrival') || title.includes('received')) {
      targetUrl = role === 'procurement' ? '/procurement/new-arrivals' : '/inventory/informed-arrivals';
    } else if (title.includes('request') || title.includes('assigned') || title.includes('reserved') || title.includes('approval')) {
      if (role === 'employee') {
        targetUrl = '/employee/all-emp-requests';
      } else if (role === 'divisionhead' || role === 'inventorymanager' || role === 'inventory manager') {
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
