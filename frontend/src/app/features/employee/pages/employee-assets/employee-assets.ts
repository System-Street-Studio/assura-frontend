import { Component, computed, signal, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';
import { AssetService } from '../../../../features/inventory/services/asset.service';
import { AssetDetail } from '../../../../features/inventory/models/asset.model';
import { EmployeeTransferService } from '../../services/asset-transfer.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { LostItemsService } from '../../../../services/lost-items.service';

interface Asset {
  assetId: string;
  assetCode: string;
  assetName: string;
  image: string;
  conditionStatus: string;
  //assignedDate: string;
  status: string;
  category: string;
  description?: string;
  serialNumber?: string;
  assignedEmployee: string;
}

@Component({
  selector: 'app-employee-assets',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, PaginationComponent],
  templateUrl: './employee-assets.html',
  styleUrls: ['./employee-assets.css']
})
export class EmployeeAssetsComponent implements OnInit {
  private assetService = inject(AssetService);
  private employeeTransferService = inject(EmployeeTransferService);
  private authService = inject(AuthService);
  private lostItemsService = inject(LostItemsService);
  private router = inject(Router);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // Check if click is inside status filter container
    const inStatusFilter = target.closest('[data-filter="status-filter"]') !== null;

    // Check if click is inside category filter container
    const inCategoryFilter = target.closest('[data-filter="category-filter"]') !== null;

    // Close status menu if clicking outside
    if (this.statusMenuOpen() && !inStatusFilter) {
      this.statusMenuOpen.set(false);
    }

    // Close category menu if clicking outside
    if (this.categoryMenuOpen() && !inCategoryFilter) {
      this.categoryMenuOpen.set(false);
    }
  }

  searchTerm = signal('');
  isLoading = signal(true);
  statusMenuOpen = signal(false);
  categoryMenuOpen = signal(false);

  viewMode = signal<'grid' | 'list'>('grid');

  onSearchChange(value: string) {
    this.searchTerm.set(value);
    this.currentPage.set(1);
  }
  selectedAsset = signal<Asset | null>(null);
  selectedStatus = signal('');
  selectedCategory = signal('');

  // Pagination
  pageSize = 20;
  currentPage = signal(1);

  assets = signal<Asset[]>([]);

  //map asset details
  ngOnInit() {
    this.isLoading.set(true);

    // Assets currently assigned to me, plus assets I used to hold that are still out
    // on an active transfer — without the latter, an asset silently disappears from
    // this page the moment it's transferred away, with no trace it ever existed here.
    forkJoin({
      owned: this.assetService.getAll(true),
      transferredAway: this.employeeTransferService.getTransfers('active').pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ owned, transferredAway }) => {
        const mapped = owned.map(a => ({
          assetId: a.id.toString(),
          assetCode: a.assetCode,
          assetName: a.productName,
          category: a.categoryName,
          serialNumber: a.serialNumber || 'N/A',
          description: a.notes ||  'N/A',
          assignedEmployee: a.assignedUserName || 'Me',
          assignedDate:  'N/A',
          conditionStatus: 'N/A',
          status: this.formatStatus(a.status),
          image: ''
        }));

        const myUserId = Number(this.authService.getUserId());
        const awayMapped = transferredAway
          .filter((t: any) => t.currentHolderId === myUserId)
          .map((t: any) => ({
            assetId: `transfer-${t.id}`,
            assetCode: t.assetCode,
            assetName: t.productName || t.assetCode,
            category: 'N/A',
            serialNumber: 'N/A',
            description: `Currently with ${t.targetUserName || 'another employee'} (${t.toDivisionName || 'N/A'}) since ${new Date(t.transferDate).toLocaleDateString()}.${t.reason ? ' Reason: ' + t.reason : ''}`,
            assignedEmployee: t.targetUserName || 'N/A',
            assignedDate: 'N/A',
            conditionStatus: 'N/A',
            status: 'Transferred',
            image: ''
          }));

        this.assets.set([...mapped, ...awayMapped]);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

//view mode change
  setViewMode(mode: 'grid' | 'list') {
  this.viewMode.set(mode);
  }

  private formatStatus(status: string): string {
    const map: Record<string, string> = {
      'InUse': 'In Use',
      'InStore': 'Stored',
      'UnderMaintenance': 'Maintenance',
      'Discarded': 'Discarded',
      'Transferred': 'Transferred'
    };
    return map[status] || status;
  }

//catagories
  categories = computed(() => {
    const uniqueCategories = [...new Set(this.assets().map(a => a.category))];
    return uniqueCategories.sort();
  });

  //assets counts
  totalAssets = computed(() => this.assets().length);

  assetsInUse = computed(() =>
    this.assets().filter(a => a.status === 'In Use').length
  );

  assetsInMaintenance = computed(() =>
    this.assets().filter(a => a.status === 'Maintenance').length
  );

  assetsTransferred = computed(() =>
    this.assets().filter(a => a.status === 'Transferred').length
  );

  assetsDiscarded = computed(() =>
    this.assets().filter(a => a.status === 'Discarded').length
  );

  //filter section
  filteredAssets = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const status = this.selectedStatus();
    const category = this.selectedCategory();

    return this.assets().filter(asset => {
      const matchesTerm = asset.assetName.toLowerCase().includes(term);
      const matchesStatus = status ? asset.status === status : true;
      const matchesCategory = category ? asset.category === category : true;
      return matchesTerm && matchesStatus && matchesCategory;
    });
  });


  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredAssets().length / this.pageSize)));

  paginatedAssets = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredAssets().slice(start, start + this.pageSize);
  });

  pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  // navigation to pages
  onPageChange(page: number) {
    this.currentPage.set(page);
  }

//view button
  viewDetails(asset: Asset) {
    this.selectedAsset.set(asset);
  }

  //back button
  backToList() {
    this.selectedAsset.set(null);
  }

  //filter by status
  setStatus(status: string) {
    this.selectedStatus.set(status === 'All' ? '' : status);
    this.statusMenuOpen.set(false);
    this.currentPage.set(1);
  }

  //fileter by category
  setCategory(category: string) {
    this.selectedCategory.set(category === 'All Categories' ? '' : category);
    this.categoryMenuOpen.set(false);
    this.currentPage.set(1);
  }

  //get status lables
  getStatusLabel(): string {
    return this.selectedStatus() || 'All Status';
  }

  //get asset categories
  getCategoryLabel(): string {
    return this.selectedCategory() || 'All Categories';
  }

  //status badge
  getStatusBadgeClass(status: string | undefined): string {
    if (!status) return '';
    return status.replace(' ', '-').toLowerCase();
  }

  //button for go to discard form
  goToMaintenanceForm(): void {
    if (this.selectedAsset()) {
      this.router.navigate(['/employee/maintenance-form'], {
        state: { assetName: this.selectedAsset()?.assetName }
      });
    }
  }

  //button for go to discard form
  goToDiscardForm(): void {
    const currentAsset = this.selectedAsset();
    if (currentAsset) {
      if (currentAsset.status === 'Maintenance' || currentAsset.status === 'Under Maintenance' || currentAsset.status === 'UnderMaintenance') {
        alert('Assets under maintenance cannot be discarded.');
        return;
      }
      this.router.navigate(['/employee/discard-form'], {
        state: { assetName: currentAsset.assetName }
      });
    }
  }

  reportLostAsset(): void {
    const currentAsset = this.selectedAsset();
    if (!currentAsset) return;

    if (confirm(`Are you sure you want to report asset "${currentAsset.assetName}" (#${currentAsset.assetCode}) as lost?`)) {
      const assetIdNum = parseInt(currentAsset.assetId, 10);
      this.lostItemsService.create({
        assetId: isNaN(assetIdNum) ? null : assetIdNum,
        assetName: currentAsset.assetName,
        division: 'Employee Division',
        assetType: currentAsset.category || '',
        description: `Reported lost by employee.`
      }).subscribe({
        next: () => {
          alert(`Asset "${currentAsset.assetName}" reported lost. The Superintendent will review it.`);
          this.selectedAsset.set(null);
          this.ngOnInit();
        },
        error: (err) => {
          console.error('Failed to report lost asset:', err);
          alert('Failed to report lost asset. Please try again.');
        }
      });
    }
  }
}
