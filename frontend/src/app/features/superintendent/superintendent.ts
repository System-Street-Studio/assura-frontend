import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { NavbarComponent } from "./components/navbar/navbar";
import { SidebarComponent } from "./components/sidebar/sidebar";

@Component({
    selector: 'app-superintendent',
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
    styleUrls: ['./superintendent.css']
})
export class SuperintendentComponent { }
