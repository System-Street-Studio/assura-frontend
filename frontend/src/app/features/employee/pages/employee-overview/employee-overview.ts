import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { AuthService } from '../../../../core/auth/auth.service';
import { AssetService, AssetRequest } from '../../services/asset-request.service';
import { DashboardService } from '../../../../features/inventory/services/dashboard.service';
import { DashboardData } from '../../../../features/inventory/models/dashboard.model';

interface RequestItem {
  item: string;
  date: string;
  status: string;
  priority: 'High' | 'Medium' | 'Low';
}

interface Activity {
  description: string;
  timestamp: string;
}

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIcon],
  templateUrl: './employee-overview.html',
  styleUrls: ['./employee-overview.css']
})
export class EmployeeOverviewComponent implements OnInit {
  private authService = inject(AuthService);
  private assetService = inject(AssetService);
  private dashboardService = inject(DashboardService);

  loading = signal(true);
  pendingRequests = signal<RequestItem[]>([]);
  recentActivities = signal<Activity[]>([]);

  assignedAssetsCount = signal<number>(0);
  pendingRequestsCount = signal<number>(0);
  temporaryTransfersCount = signal<number>(0);
  maintenanceCount = signal<number>(0);

  ngOnInit() {
    const userId = this.authService.getUserId();
    if (!userId) return;

    // Fetch Requests
    this.assetService.getEmployeeRequests(userId).subscribe({
      next: (data: any) => {
        console.log("getEmployeeRequests returned:", data);
        if (!Array.isArray(data)) {
            console.error("Data is not an array!", data);
            return;
        }
        const pending = data
          .filter(r => r.status === 'Pending')
          .slice(0, 5)
          .map(r => ({
            item: r.assetName,
            date: r.submittedDate,
            status: r.status,
            priority: (r.priority as any) || 'Medium'
          }));
        this.pendingRequests.set(pending);
      }
    });

    // Fetch Dashboard Activity
    this.dashboardService.getDashboardData().subscribe({
      next: (data: DashboardData) => {
        console.log("getDashboardData returned:", data);
        if (data && Array.isArray(data.recentActivity)) {
            const activities = data.recentActivity.map(a => ({
              description: `${a.assetName} (${a.assetCode}) - ${a.action}`,
              timestamp: this.formatTimeAgo(new Date(a.timestamp))
            }));
            this.recentActivities.set(activities);
        } else {
            console.error("data.recentActivity is not an array!", data.recentActivity);
        }

        this.assignedAssetsCount.set(data.kpis?.totalAssets || 0);
        this.pendingRequestsCount.set(data.kpis?.pendingRequests || 0);
        this.temporaryTransfersCount.set(data.kpis?.temporaryAssignedAssets || 0);
        this.maintenanceCount.set(data.kpis?.maintenanceDue || 0);

        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  private formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }
}