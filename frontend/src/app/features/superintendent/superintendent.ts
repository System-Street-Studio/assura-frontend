import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { SharedNavbarComponent } from "../../shared/components/navbar/navbar";
import { SharedSidebarComponent } from "../../shared/components/sidebar/sidebar";
import { AuthService } from '../../core/auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-superintendent',
  standalone: true,
  imports: [RouterOutlet, SharedNavbarComponent, SharedSidebarComponent, CommonModule],
    template: `
    <div class="shell-layout">
      <app-shared-sidebar></app-shared-sidebar>
      <div class="main-area">
        <app-shared-navbar></app-shared-navbar>
        <main class="content">
          @if (isPendingUser) {
            <div class="pending-user-view" style="display: flex; align-items: center; justify-content: center; height: calc(100vh - 120px); text-align: center; flex-direction: column;">
              <div class="glass-card" style="padding: 48px; max-width: 500px; display: flex; flex-direction: column; align-items: center; gap: 24px; border: 1px solid rgba(245, 158, 11, 0.3);">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <h2 style="color: #f8fafc; font-size: 24px; font-weight: 700; margin: 0;">Account Under Review</h2>
                <p style="color: #94a3b8; font-size: 16px; margin: 0; line-height: 1.5;">Your account is under review, wait for HR review.</p>
              </div>
            </div>
          } @else {
            <router-outlet></router-outlet>
          }
        </main>
      </div>
    </div>
  `,
  styleUrls: ['./superintendent.css'],
})
export class SuperintendentComponent {
  isPendingUser = false;

  constructor(private authService: AuthService) {
    const hasPendingRole = this.authService.hasRole('Pending');
    const isSysAdmin = this.authService.hasRole('SystemAdmin');
    const noDivision = !this.authService.getDivisionId();
    this.isPendingUser = hasPendingRole || (noDivision && !isSysAdmin);
  }
}
