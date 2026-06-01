import { Component, OnInit, OnDestroy, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, NavigationEnd } from "@angular/router";
import { filter } from "rxjs/operators";
import { QueueItemsService } from "../../../../services/queue-items.service";

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './navbar.html',
    styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
    title: string = 'Discarded Notes';

    // Live clock
    currentTime: string = '';
    currentDate: string = '';
    private clockInterval: any;

    // Pending notification count
    pendingCount: number = 0;

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

        // Start live clock
        this.updateClock();
        this.clockInterval = setInterval(() => this.updateClock(), 1000);

        // Load pending count
        this.loadPendingCount();
    }

    ngOnDestroy() {
        if (this.clockInterval) {
            clearInterval(this.clockInterval);
        }
    }

    private updateClock() {
        const now = new Date();
        this.currentTime = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        this.currentDate = now.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
        this.cdr.markForCheck();
    }

    private loadPendingCount() {
        this.queueItemsService.getAll().subscribe({
            next: (items) => {
                this.pendingCount = items.filter(i => i.status === 'Pending').length;
                this.cdr.markForCheck();
            },
            error: () => { 
                this.pendingCount = 0; 
                this.cdr.markForCheck();
            }
        });
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