import { Component, signal, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { AuthService } from '../../../../core/auth/auth.service';
import { AssetService as EmpAssetService, AssetRequest } from '../../services/asset-request.service';
import { AssetService as InvAssetService } from '../../../../features/inventory/services/asset.service';
import { AssetDetail } from '../../../../features/inventory/models/asset.model';

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

  isLoading = signal(true);
  pendingRequests = signal<RequestItem[]>([]);
  assignedAssets = signal<AssetDetail[]>([]);

  greeting = '';
  firstName = '';
  today = new Date();

  // Summary counts
  myAssignedAssetsCount = computed(() => this.assignedAssets().length);
  pendingCount = computed(() => this.pendingRequests().length);
  maintenanceCount = computed(() => this.assignedAssets().filter(a => a.status === 'UnderMaintenance').length);
  transfersCount = computed(() => this.assignedAssets().filter(a => a.status === 'Transferred').length);

  ngOnInit() {
    this.firstName = this.authService.getFirstName() ?? 'Employee';
    this.greeting = this.getGreeting();
    this.isLoading.set(true);

    const userId = this.authService.getUserId();
    if (!userId) {
      this.isLoading.set(false);
      return;
    }

    // Fetch Requests
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

    // Fetch Assigned Assets
    this.invAssetService.getAll(true).subscribe({
      next: (assets: AssetDetail[]) => {
        this.assignedAssets.set(assets);
        this.checkLoadingComplete();
      },
      error: () => this.checkLoadingComplete()
    });
  }

  private loadedCount = 0;
  private checkLoadingComplete() {
    this.loadedCount++;
    if (this.loadedCount >= 2) {
      this.isLoading.set(false);
    }
  }

  private getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }
}