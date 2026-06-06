import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ProfileService } from '../../../../core/services/profile.service';
import { DivisionHeadDashboardService, DivisionOverviewSummary } from '../../services/division-head-dashboard.service';
import { RequestService } from '../../services/requests.service';

interface PendingRequest {
  item: string;
  date: string;
  status: string;
  priority: string;
}

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './overview-page.html',
  styleUrls: ['./overview-page.css']
})
export class DivisionHeadOverviewComponent implements OnInit {
  private profileService = inject(ProfileService);
  private dashboardService = inject(DivisionHeadDashboardService);
  private requestService = inject(RequestService);

  // Metrics signals 
  totalAssetsCount = signal<number>(0);
  totalAssetValue = signal<number>(0);
  activeRequestsCount = signal<number>(0);
  transferredAssetsCount = signal<number>(0);

  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');
  pendingRequests = signal<PendingRequest[]>([]);

  ngOnInit() {
    this.loadDashboardData();
    this.loadPendingData();
  }

  /**
   * get data for dashboard metrics from backend and update signals accordingly
   */
  private loadDashboardData(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.profileService.getProfile().subscribe({
      next: (profile) => {
        if (!profile.divisionId) {
          this.isLoading.set(false);
          return;
        }

        // get DivisionId from profile and fetch dashboard summary data
        this.dashboardService.getDivisionOverviewSummary(profile.divisionId).subscribe({
          next: (summary: DivisionOverviewSummary) => {
            this.totalAssetsCount.set(summary.assetsCount);
            this.totalAssetValue.set(summary.assetsPurchaseValue);
            this.activeRequestsCount.set(summary.pendingRequestsCount);
            this.transferredAssetsCount.set(summary.transferredAssetsCount);
            
            // Service 
            this.dashboardService.updateAssetCount(summary.assetsCount);
            
            this.isLoading.set(false);
          },
          error: (error) => {
            console.error('Metrics loading error:', error);
            this.isLoading.set(false);
          }
        });
      },
      error: (error) => {
        console.error('Profile loading error:', error);
        this.isLoading.set(false);
      }
    });
  }

  /**
   // Pending Requests get and map
   */
  loadPendingData(): void {
    this.requestService.getPendingRequests().subscribe({
      next: (data: any[]) => {
        const mappedRequests = data.map(req => ({
          item: req.assetName || req.productName || 'Unknown Item',
          date: req.submittedDate || req.createdAt,
          status: typeof req.status === 'number' ? this.mapStatus(req.status) : req.status,
          priority: req.priority || 'Normal'
        }));

        this.pendingRequests.set(mappedRequests);
      },
      error: (error) => {
        console.error('Error fetching requests:', error);
      }
    });
  }

  private mapStatus(statusNum: number): string {
    const statuses = ['Pending', 'Approved', 'Rejected'];
    return statuses[statusNum] || 'Pending';
  }

  formatNumber(value: number): string {
    if (value >= 1000000) return 'Rs.' + (value / 1000000).toFixed(1) + 'M';
    if (value >= 1000) return 'Rs.' + (value / 1000).toFixed(1) + 'K';
    return 'Rs.' + value.toLocaleString();
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString;
    }
  }
}