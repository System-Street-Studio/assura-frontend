import { Component, signal, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { AuthService } from '../../../../core/auth/auth.service';
import { AssetService as EmpAssetService, AssetRequest, EmployeeArrivedAsset } from '../../services/asset-request.service';
import { AssetService as InvAssetService } from '../../../../features/inventory/services/asset.service';
import { AssetDetail } from '../../../../features/inventory/models/asset.model';
import { NotificationService } from '../../../../shared/services/notification.service';

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
  imports: [CommonModule, RouterModule, MatIcon],
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

  greeting = '';
  firstName = '';
  today = new Date();

  isAwaitingConfirmation(status?: string): boolean {
    if (!status) return true;
    const s = status.trim().toLowerCase();
    return s === 'informed' || s === 'pending';
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

    if (!divisionId) {
      this.isPendingUser = true;
      this.isLoading.set(false);
      return;
    }

    this.loadData(userId, Number(divisionId));
  }

  loadData(userId: string, divisionId?: number) {
    this.loadedCount = 0;

    

    // 1. Fetch Arrived Assets / Arrivals pending confirmation
    this.empAssetService.getArrivedAssets(divisionId).subscribe({
      next: (arrivals: EmployeeArrivedAsset[]) => {
        this.arrivedAssets.set(arrivals || []);
        this.checkLoadingComplete();
      },
      error: () => this.checkLoadingComplete()
    });

    // 2. Fetch Requests
    this.empAssetService.getEmployeeRequests(userId).subscribe({
      next: (data: AssetRequest[]) => {
        const pending = data
          .filter(r => r.status === 'Pending' || r.status?.toLowerCase().includes('pending'))
          .slice(0, 10)
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

  getStatusClass(status: string): string {
    if (!status) return 'status-unknown';
    const s = status.trim().toLowerCase();
    
    if (s === 'pendingprocurement' || s === 'pending-procurement') {
      return 'status-pendingprocurement';
    }
    
    return `status-${s}`;
  }
}
