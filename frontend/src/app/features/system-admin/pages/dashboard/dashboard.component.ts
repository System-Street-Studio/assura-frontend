import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-system-admin-dashboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class SystemAdminDashboardComponent implements OnInit {
    private cdr = inject(ChangeDetectorRef);
    loading = false;
    errorMessage?: string;

    // Dummy data for presentation, to be replaced with a real service later
    stats = {
        totalDepartments: 12,
        activeCategories: 24,
        recentLogins: 145,
        activeSessions: 18,
        errorLogsCount: 5,
        auditLogsCount: 342,
        systemHealth: 'Optimal'
    };

    ngOnInit() {
        console.log('[DEBUG] SystemAdminDashboardComponent: Initializing...');
        // In a real scenario, fetch from a SystemAdminService
        this.loading = false;
    }

    get summaryStats() {
        return [
            { label: 'Active Sessions', value: this.stats.activeSessions, highlighted: true },
            { label: 'System Health', value: this.stats.systemHealth, highlighted: false }
        ];
    }
}
