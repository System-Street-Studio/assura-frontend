import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SharedNavbarComponent } from '../../../shared/components/navbar/navbar';
import { SharedSidebarComponent } from '../../../shared/components/sidebar/sidebar';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
    selector: 'app-acc-shell',
    standalone: true,
    imports: [CommonModule, RouterOutlet, SharedNavbarComponent, SharedSidebarComponent],
    templateUrl: './acc-shell.html',
    styleUrls: ['./acc-shell.css']
})
export class AccShellComponent {
  isPendingUser = false;

  constructor(public authService: AuthService) {
    this.isPendingUser = this.authService.isPendingUser();
  }
}
