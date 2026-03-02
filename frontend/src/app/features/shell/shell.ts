import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar';
import { SidebarComponent } from './components/sidebar/sidebar';
import { LoadingService } from '../../core/services/loading.service';
import { OnInit, inject } from '@angular/core';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent],
  template: `
    <div class="shell-layout">
      <app-sidebar></app-sidebar>
      <div class="main-area">
        <app-navbar></app-navbar>
        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styleUrls: ['./shell.css'],
})
export class ShellComponent implements OnInit {
  private loadingService = inject(LoadingService);

  ngOnInit(): void {
    // Hide the loader once the shell is initialized
    this.loadingService.hide();
  }
}
