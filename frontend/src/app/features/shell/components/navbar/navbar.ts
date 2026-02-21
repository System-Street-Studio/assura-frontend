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
    const roles = this.authService.getRoles();
    return roles.length > 0 ? roles[roles.length - 1] : 'Guest';
  }
}
