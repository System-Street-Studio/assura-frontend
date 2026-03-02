import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class NavbarComponent {
  private authService = inject(AuthService);

  get roleName(): string {
    const role = this.authService.getRole();
    if (Array.isArray(role)) {
      return role.includes('Admin') ? 'Admin' : role.join(', ');
    }
    if (typeof role === 'string' && role.toUpperCase().includes('ADMIN')) {
      return 'Admin';
    }
    return role ?? 'Guest';
  }
}
