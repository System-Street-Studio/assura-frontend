import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
    selector: 'app-acc-sidebar',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive],
    templateUrl: './acc-sidebar.html',
    styleUrls: ['./acc-sidebar.css']
})
export class AccSidebarComponent {
    isCollapsed = false;

    @Output() collapsedChange = new EventEmitter<boolean>();

    toggleSidebar() {
        this.isCollapsed = !this.isCollapsed;
        this.collapsedChange.emit(this.isCollapsed);
    }
}
