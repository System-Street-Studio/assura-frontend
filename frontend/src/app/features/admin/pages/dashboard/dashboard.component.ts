import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../../core/services/admin.service';
import { AdminStats } from '../../models/admin-stats.model';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
    private adminService = inject(AdminService);
    private cdr = inject(ChangeDetectorRef);
    stats?: AdminStats;
    loading = true;
    errorMessage?: string;

    ngOnInit() {
        console.log('[DEBUG] DashboardComponent: Initializing...');
        this.adminService.getDashboardStats().subscribe({
            next: (stats) => {
                console.log('[DEBUG] DashboardComponent: Stats received', stats);
                this.stats = stats;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (error: any) => {
                console.error('[DEBUG] DashboardComponent: Error fetching stats', error);
                this.errorMessage = `Error: ${error.status} - ${error.message || 'Unknown error'}`;
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    // Map backend stats to frontend models
    get summaryStats() {
        if (!this.stats) {
            console.log('[DEBUG] summaryStats returning empty');
            return [];
        }
        const data = [
            { label: 'Total Assets', value: this.stats.totalAssets, highlighted: true },
            { label: 'Total Users', value: this.stats.totalUsers, highlighted: false }
        ];
        console.log('[DEBUG] summaryStats returning', data);
        return data;
    }

    get assetsByStatus() {
        const data = this.stats?.assetsByStatus.map(s => ({
            label: s.label,
            value: s.count
        })) || [];
        console.log('[DEBUG] assetsByStatus returning', data);
        return data;
    }

    get assetsByCategory() {
        return this.stats?.assetsByCategory.map(c => ({
            label: c.label,
            value: c.count
        })) || [];
    }

    get assetsByDivision() {
        return this.stats?.assetsByDivision.map(d => ({
            label: d.label,
            value: d.count
        })) || [];
    }
}

