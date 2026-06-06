import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AccPendingItemsService, AccPendingItem } from '../../../../../services/acc-pending-items.service';

@Component({
    selector: 'app-acc-navbar',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './acc-navbar.html',
    styleUrls: ['./acc-navbar.css']
})
export class AccNavbarComponent implements OnInit {
    pendingItems: AccPendingItem[] = [];
    showNotifications = false;

    constructor(
        private router: Router,
        private pendingItemsService: AccPendingItemsService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.loadPendingRequests();
    }

    loadPendingRequests() {
        this.pendingItemsService.getAll().subscribe({
            next: (data) => {
                // Get both 'pending' and 'to-be-approved' items
                this.pendingItems = data.filter(i => i.category === 'pending' || i.category === 'to-be-approved');
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error('Failed to load pending items in navbar:', err);
            }
        });
    }

    toggleNotifications(event: MouseEvent) {
        event.stopPropagation();
        this.showNotifications = !this.showNotifications;
        if (this.showNotifications) {
            this.loadPendingRequests();
        }
    }

    selectRequest(id: string) {
        this.showNotifications = false;
        this.router.navigate(['/accountant/overview'], { queryParams: { selectId: id } });
    }

    @HostListener('document:click')
    closeDropdown() {
        this.showNotifications = false;
    }

    goToRoleSelect() {
        this.router.navigate(['/']);
    }
}
