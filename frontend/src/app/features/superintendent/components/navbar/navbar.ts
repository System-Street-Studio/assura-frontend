import { Component, OnInit, OnDestroy, Output, EventEmitter, ChangeDetectorRef, HostListener } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, NavigationEnd } from "@angular/router";
import { filter } from "rxjs/operators";
import { QueueItemsService, QueueItem } from "../../../../services/queue-items.service";

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './navbar.html',
    styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
    title: string = 'Discarded Notes';

    // Pending notification count & items
    pendingCount: number = 0;
    pendingItems: QueueItem[] = [];
    showNotifications = false;

    // Sidebar toggle
    @Output() menuToggled = new EventEmitter<void>();

    constructor(
        private router: Router,
        private queueItemsService: QueueItemsService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        // Route title tracking
        this.updateTitle(this.router.url);
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe((event: any) => {
            this.updateTitle(event.urlAfterRedirects);
            this.cdr.markForCheck();
        });

        // Load pending count & items
        this.loadPendingCount();
    }

    ngOnDestroy() {
    }

    private loadPendingCount() {
        this.queueItemsService.getAll().subscribe({
            next: (items) => {
                this.pendingItems = items.filter(i => i.status === 'Pending');
                this.pendingCount = this.pendingItems.length;
                this.cdr.markForCheck();
            },
            error: () => { 
                this.pendingItems = [];
                this.pendingCount = 0; 
                this.cdr.markForCheck();
            }
        });
    }

    toggleNotifications(event: MouseEvent) {
        event.stopPropagation();
        this.showNotifications = !this.showNotifications;
        if (this.showNotifications) {
            this.loadPendingCount();
        }
    }

    selectRequest(id: string) {
        this.showNotifications = false;
        this.router.navigate(['/superintendent/overview'], { queryParams: { selectId: id } });
    }

    @HostListener('document:click')
    closeDropdown() {
        this.showNotifications = false;
    }

    private updateTitle(url: string) {
        if (url.includes('overview')) this.title = 'Overview';
        else if (url.includes('my-assets')) this.title = 'My Assets';
        else if (url.includes('discarded-notes')) this.title = 'Discarded Notes';
        else if (url.includes('buyer')) this.title = 'Buyer';
    }

    toggleMenu() {
        this.menuToggled.emit();
    }

    goToRoleSelect() {
        this.router.navigate(['/']);
    }
}