import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
  private router = inject(Router);

  get sectionName(): string {
    const currentUrl = this.router.url;
    const sections: { [key: string]: string } = {
      'admin': 'Admin',
      'procurement': 'Procurement',
      'inventory': 'Inventory',
      'hr': 'HR',
      'accountant': 'Accountant',
      'reporting': 'Reporting',
      'superintendent': 'Superintendent'
    };

    const activeSectionKey = Object.keys(sections).find(s => currentUrl.startsWith(`/${s}`));
    if (activeSectionKey) {
      return sections[activeSectionKey];
    }

    // Default or Fallback to role if no section matched
    const role = this.authService.getRole();
    if (typeof role === 'string' && role.toUpperCase().includes('ADMIN')) {
      return 'Admin';
    }
    return role ?? 'Dashboard';
  }
}
