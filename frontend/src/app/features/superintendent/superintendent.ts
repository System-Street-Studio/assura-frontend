import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { SharedNavbarComponent } from "../../shared/components/navbar/navbar";
import { SharedSidebarComponent } from "../../shared/components/sidebar/sidebar";

@Component({
    selector: 'app-superintendent',
    standalone: true,
    imports: [RouterOutlet, SharedNavbarComponent, SharedSidebarComponent],
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
    `,
    styleUrls: ['./superintendent.css']
})
export class SuperintendentComponent { }
