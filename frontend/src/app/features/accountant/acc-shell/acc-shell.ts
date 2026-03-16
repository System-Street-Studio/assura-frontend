import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AccNavbarComponent } from './components/acc-navbar/acc-navbar';
import { AccSidebarComponent } from './components/acc-sidebar/acc-sidebar';

@Component({
    selector: 'app-acc-shell',
    standalone: true,
    imports: [CommonModule, RouterOutlet, AccNavbarComponent, AccSidebarComponent],
    templateUrl: './acc-shell.html',
    styleUrls: ['./acc-shell.css']
})
export class AccShellComponent { }
