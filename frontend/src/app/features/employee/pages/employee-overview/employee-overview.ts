import { Component, signal, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { AuthService } from '../../../../core/auth/auth.service';
import { AssetService as EmpAssetService, AssetRequest, EmployeeArrivedAsset } from '../../services/asset-request.service';
import { AssetService as InvAssetService } from '../../../../features/inventory/services/asset.service';
import { AssetDetail } from '../../../../features/inventory/models/asset.model';
import { NotificationService } from '../../../../shared/services/notification.service';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';

interface RequestItem {
  id: number;
  item: string;
  requestDate: string;
  submittedBy: string;
  requestType: string;
  status: string;
  priority: 'High' | 'Medium' | 'Low';
}

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIcon, PaginationComponent],
  templateUrl: './employee-overview.html',
  styleUrls: ['./employee-overview.css']
})
export class EmployeeOverviewComponent implements OnInit {
  private authService = inject(AuthService);
  private empAssetService = inject(EmpAssetService);
  private invAssetService = inject(InvAssetService);
  private notifService = inject(NotificationService);

  isPendingUser = false;

  isLoading = signal(true);
  pendingRequests = signal<RequestItem[]>([]);
  assignedAssets = signal<AssetDetail[]>([]);
  arrivedAssets = signal<EmployeeArrivedAsset[]>([]);
  confirmingId = signal<number | null>(null);
  confirmSuccessMessage = signal<string | null>(null);

  pendingRequestsCurrentPage = signal(1);
  readonly pendingRequestsPageSize = 5;

  arrivedAssetsCurrentPage = signal(1);
  readonly arrivedAssetsPageSize = 5;

  greeting = '';
  firstName = '';
  today = new Date();

  activeArrivalFilter = signal<'all' | 'pending' | 'confirmed'>('all');

  private sortByRequestOrderDesc(a: AssetRequest, b: AssetRequest): number {
    return Number(b.id) - Number(a.id);
  }

  private sortByArrivalOrderDesc(a: EmployeeArrivedAsset, b: EmployeeArrivedAsset): number {
    return Number(b.id) - Number(a.id);
  }

  private buildPageNumbers(total: number, current: number): number[] {
    const pages: number[] = [];
    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + 4);

    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  isAwaitingConfirmation(status?: string): boolean {
    if (!status) return false;
    const s = status.trim().toLowerCase();
    return s === 'informed' || s === 'pending' || s === 'grn recorded' || s === 'grnrecorded' || s === 'received';
  }

  isConfirmedOrCompleted(status?: string): boolean {
    if (!status) return false;
    const s = status.trim().toLowerCase();
    return s === 'confirmed' || s === 'completed';
  }

  // Summary counts
  myAssignedAssetsCount = computed(() => this.assignedAssets().length);
  pendingCount = computed(() => this.pendingRequests().length);
  maintenanceCount = computed(() => this.assignedAssets().filter(a => a.status === 'UnderMaintenance').length);
  transfersCount = computed(() => this.assignedAssets().filter(a => a.status === 'Transferred').length);
  pendingArrivalsCount = computed(() => this.arrivedAssets().filter(a => this.isAwaitingConfirmation(a.status)).length);
  confirmedArrivalsCount = computed(() => this.arrivedAssets().filter(a => this.isConfirmedOrCompleted(a.status)).length);

  filteredArrivedAssets = computed(() => {
    const list = this.arrivedAssets();
    const filter = this.activeArrivalFilter();
    if (filter === 'pending') {
      return list.filter(a => this.isAwaitingConfirmation(a.status));
    }
    if (filter === 'confirmed') {
      return list.filter(a => this.isConfirmedOrCompleted(a.status));
    }
    return list;
  });

  setArrivalFilter(filter: 'all' | 'pending' | 'confirmed') {
    this.activeArrivalFilter.set(filter);
    this.arrivedAssetsCurrentPage.set(1);
  }

  pendingRequestsTotalPages = computed(() =>
    Math.max(1, Math.ceil(this.pendingRequests().length / this.pendingRequestsPageSize))
  );

  pendingRequestsPageNumbers = computed(() =>
    this.buildPageNumbers(this.pendingRequestsTotalPages(), this.pendingRequestsCurrentPage())
  );

  paginatedPendingRequests = computed(() => {
    const start = (this.pendingRequestsCurrentPage() - 1) * this.pendingRequestsPageSize;
    const end = start + this.pendingRequestsPageSize;
    return this.pendingRequests().slice(start, end);
  });

  arrivedAssetsTotalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredArrivedAssets().length / this.arrivedAssetsPageSize))
  );

  arrivedAssetsPageNumbers = computed(() =>
    this.buildPageNumbers(this.arrivedAssetsTotalPages(), this.arrivedAssetsCurrentPage())
  );

  paginatedArrivedAssets = computed(() => {
    const start = (this.arrivedAssetsCurrentPage() - 1) * this.arrivedAssetsPageSize;
    const end = start + this.arrivedAssetsPageSize;
    return this.filteredArrivedAssets().slice(start, end);
  });

  ngOnInit() {
    this.firstName = this.authService.getFirstName() ?? 'Employee';
    this.greeting = this.getGreeting();
    this.isLoading.set(true);

    const userId = this.authService.getUserId();
    const divisionId = this.authService.getDivisionId();

    if (!userId) {
      this.isLoading.set(false);
      return;
    }

    const roles = this.authService.getRoles();
    if (roles.includes('Pending') && roles.length === 1) {
      this.isPendingUser = true;
      this.isLoading.set(false);
      return;
    }

    this.loadData(userId, divisionId ? Number(divisionId) : undefined);
  }

  loadData(userId: string, divisionId?: number) {
    this.loadedCount = 0;

    // 1. Fetch Arrived Assets / Arrivals pending confirmation
    this.empAssetService.getArrivedAssets(divisionId).subscribe({
      next: (arrivals: EmployeeArrivedAsset[]) => {
        this.arrivedAssets.set([...(arrivals || [])].sort((a, b) => this.sortByArrivalOrderDesc(a, b)));
        this.arrivedAssetsCurrentPage.set(1);
        this.checkLoadingComplete();
      },
      error: (err) => {
        console.error('Error loading employee arrivals:', err);
        this.checkLoadingComplete();
      }
    });

    // 2. Fetch Requests
    this.empAssetService.getEmployeeRequests(userId).subscribe({
      next: (data: AssetRequest[]) => {
        const pending = [...data]
          .sort((a, b) => this.sortByRequestOrderDesc(a, b))
          .filter(r => r.status === 'Pending' || r.status?.toLowerCase().includes('pending'))
          .map(r => ({
            id: r.id,
            item: r.assetName,
            requestDate: r.submittedDate,
            submittedBy: r.submittedBy,
            requestType: r.requestType,
            status: r.status,
            priority: (r.priority as any) || 'Medium'
          }));
        this.pendingRequests.set(pending);
        this.pendingRequestsCurrentPage.set(1);
        this.checkLoadingComplete();
      },
      error: () => this.checkLoadingComplete()
    });

    // 3. Fetch Assigned Assets
    this.invAssetService.getAll(true).subscribe({
      next: (assets: AssetDetail[]) => {
        this.assignedAssets.set(assets);
        this.checkLoadingComplete();
      },
      error: () => this.checkLoadingComplete()
    });
  }

  confirmArrival(asset: EmployeeArrivedAsset): void {
    if (this.confirmingId()) return;

    this.confirmingId.set(asset.id);
    this.empAssetService.confirmArrival(asset.id, 'Received and confirmed by employee').subscribe({
      next: () => {
        this.confirmingId.set(null);
        this.confirmSuccessMessage.set(`Successfully confirmed receipt of "${asset.itemName}". Storekeeper has been notified.`);

        // Update local status
        this.arrivedAssets.update(list =>
          list.map(a => a.id === asset.id ? { ...a, status: 'Confirmed' } : a)
        );

        this.notifService.fetchNotifications();

        setTimeout(() => {
          this.confirmSuccessMessage.set(null);
        }, 5000);
      },
      error: (err) => {
        this.confirmingId.set(null);
        alert('Failed to confirm receipt: ' + (err.error?.message || err.message || 'Please try again.'));
      }
    });
  }

  private loadedCount = 0;
  private checkLoadingComplete() {
    this.loadedCount++;
    if (this.loadedCount >= 3) {
      this.isLoading.set(false);
    }
  }

  private getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  onPendingRequestsPageChange(page: number): void {
    this.pendingRequestsCurrentPage.set(page);
  }

  onArrivedAssetsPageChange(page: number): void {
    this.arrivedAssetsCurrentPage.set(page);
  }

  getStatusClass(status: string): string {
    if (!status) return 'status-unknown';
    const s = status.trim().toLowerCase();

    if (s === 'pendingprocurement' || s === 'pending-procurement') {
      return 'status-pendingprocurement';
    }

    return `status-${s}`;
  }
}
