import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

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

  showProfileMenu = false;

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
  }

  toggleProfileMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.showProfileMenu = !this.showProfileMenu;
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
