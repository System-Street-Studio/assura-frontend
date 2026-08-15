import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SystemAdminService, SystemAdminDashboardStats } from '../../services/system-admin.service';

@Component({
    selector: 'app-system-admin-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class SystemAdminDashboardComponent implements OnInit {
    private cdr = inject(ChangeDetectorRef);
    private systemAdminService = inject(SystemAdminService);
    
    loading = true;
    errorMessage?: string;

    greeting = 'Welcome';
    firstName = 'Admin';
    currentDate = new Date();

    stats: SystemAdminDashboardStats = {
        totalDepartments: 0,
        activeCategories: 0,
        recentLogins: 0,
        activeSessions: 0,
        errorLogsCount: 0,
        auditLogsCount: 0,
        systemHealth: 'Loading...'
    };

    ngOnInit() {
        const hour = new Date().getHours();
        this.greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

        console.log('[DEBUG] SystemAdminDashboardComponent: Fetching real stats...');
        this.systemAdminService.getDashboardStats().subscribe({
            next: (data) => {
                this.stats = data;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Failed to load dashboard stats', err);
                this.errorMessage = 'Could not load statistics from the server.';
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    get summaryStats() {
        return [
            { label: 'Active Sessions', value: this.stats.activeSessions, highlighted: true },
            { label: 'System Health', value: this.stats.systemHealth, highlighted: false }
        ];
    }
}
