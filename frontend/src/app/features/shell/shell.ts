import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SharedNavbarComponent } from '../../shared/components/navbar/navbar';
import { SharedSidebarComponent } from '../../shared/components/sidebar/sidebar';
import { ToastComponent } from '../../shared/components/toast/toast';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SharedNavbarComponent, SharedSidebarComponent, ToastComponent],
  template: `
    <div class="shell-layout">
      <app-shared-sidebar></app-shared-sidebar>
      <div class="main-area">
        <app-shared-navbar></app-shared-navbar>
        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
    <app-toast></app-toast>
  `,
  styleUrls: ['./shell.css'],
})
export class ShellComponent { }
