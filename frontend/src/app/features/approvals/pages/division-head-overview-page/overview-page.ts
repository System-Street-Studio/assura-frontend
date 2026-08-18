import { Component, signal, inject, OnInit,computed} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ProfileService } from '../../../../core/services/profile.service';
import { DivisionHeadDashboardService, DivisionOverviewSummary } from '../../services/division-head-dashboard.service';
import { RequestService } from '../../services/requests.service';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';

interface PendingRequest {
  item: string;
  date: string;
  type: string;
  priority: string;
}

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule,PaginationComponent],
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

  pendingRequestsCurrentPage = signal(1);
  pageSize = signal(5);

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
          type: req.requestType,
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

  // Paginated Pending Requests Computed Signal
  paginatedPendingRequests = computed(() => {
    const startIndex = (this.pendingRequestsCurrentPage() - 1) * this.pageSize();
    return this.pendingRequests().slice(startIndex, startIndex + this.pageSize());
  });

  // Total Pages Computed Signal
  pendingRequestsTotalPages = computed(() => {
    return Math.ceil(this.pendingRequests().length / this.pageSize()) || 1;
  });

  // Page Numbers Array Computed Signal
  pendingRequestsPageNumbers = computed(() => {
    const total = this.pendingRequestsTotalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  // Page Change Handler Method
  onPendingRequestsPageChange(page: number) {
    if (page >= 1 && page <= this.pendingRequestsTotalPages()) {
      this.pendingRequestsCurrentPage.set(page);
    }
  }
}