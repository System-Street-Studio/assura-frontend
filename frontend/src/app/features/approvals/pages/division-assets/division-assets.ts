import { Component, signal, computed, OnInit, OnDestroy, inject, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AssetService } from '../../../../features/inventory/services/asset.service';
import { DivisionHeadDashboardService } from '../../services/division-head-dashboard.service';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';

interface Asset {
  id: string;
  name: string;
  type?: string;
  status: 'Maintenance' | 'In Use' | 'Transferred' | string;
  assignedTo?: string;
  image?: string;
  specs?: string;
  category: string;
  division: string;
  assignedUserName?: string;
  assetTag?: string;
  //image?: string;
  assignedUserId?: string;
  divisionId?: string;
  condition?: string;
  purchasedDate?: string;
  lastInspected?: string;
  serialNumber?: string;
}

@Component({
  selector: 'app-division-assets',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule, FormsModule,PaginationComponent],
  templateUrl: './division-assets.html',
  styleUrls: ['./division-assets.css']
})
export class DivisionAssetsComponent implements OnInit, OnDestroy {
  private assetService = inject(AssetService);
  private dashboardService = inject(DivisionHeadDashboardService);


  // Asset signals
  assets = signal<Asset[]>([]);
  selectedAsset = signal<Asset | null>(null);
  isLoading = signal(false);
  errorMessage = signal('');

  // Dropdown selections
  selectedCategory = signal<string>('all');
  selectedStatus = signal<string>('all');
  searchQuery = signal<string>('');
  showCategoryMenu = signal<boolean>(false);
  showStatusMenu = signal<boolean>(false);

  // Real categories from backend data
  availableCategories = signal<string[]>([]);
  viewMode = signal<'grid' | 'list'>('grid');

  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(12);
  // Asset counts for real data
  totalAssets = computed(() => this.assets().length);
  inUseAssets = computed(() => this.assets().filter(asset => asset.status === 'In Use').length);
  maintenanceAssets = computed(() => this.assets().filter(asset => asset.status === 'Maintenance').length);
  transferredAssets = computed(() => this.assets().filter(asset => asset.status === 'Transferred').length);
  setViewMode(mode: 'grid' | 'list') {
  this.viewMode.set(mode);
  }

  ngOnInit(): void {

    this.loadDivisionAssets();
    document.addEventListener('click', this.handleGlobalClick.bind(this));
  }

  ngOnDestroy(): void {
    // Clean up global click listener
    document.removeEventListener('click', this.handleGlobalClick.bind(this));
  }

  private handleGlobalClick(event: MouseEvent): void {
    const target = event.target as Element;

    // Check if click is outside filter dropdowns
    if (!target.closest('.styled-select')) {
      if (this.showCategoryMenu()) {
        this.showCategoryMenu.set(false);
      }
      if (this.showStatusMenu()) {
        this.showStatusMenu.set(false);
      }
    }
  }

  loadDivisionAssets(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.assetService.getAll().subscribe({
      next: (data) => {
        const mappedAssets: Asset[] = data.map((a: any) => ({
          id: a.id?.toString() || a.assetId?.toString() || '',
          name: a.productName || a.assetName || a.name || 'N/A',
          type: a.category || a.assetType || a.type,
          category: a.categoryName || a.category || a.type || 'General',
          division: a.divisionName || a.division || 'N/A',
          status: this.mapAssetStatus(a.status),
          assetTag: a.assetTag || a.assetCode || 'NO-TAG',
          assignedUserName: a.assignedUserName || a.assignedTo || 'Not Assigned',
          assignedUserId: a.assignedUserId?.toString(),
          specs: a.notes || a.specs || a.description || 'No details available',
          image: a.image || a.assetImage || a.imageUrl || undefined,
          condition: a.condition || 'Good',
          purchasedDate: a.purchasedDate || undefined,
          lastInspected: a.lastInspected || undefined,
          divisionId: a.divisionId?.toString() || undefined,
          serialNumber: a.serialNumber || 'N/A',
        }));

        this.assets.set(mappedAssets);
        this.dashboardService.updateAssetCount(mappedAssets.length);
        const categories = [...new Set(mappedAssets.map(a => a.category))];
        this.availableCategories.set(categories);

        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Failed to load assets.');
      }
    });
  }
  private mapAssetStatus(backendStatus: any): Asset['status'] {
    if (backendStatus === null || backendStatus === undefined) return 'In Use';
    const s = String(backendStatus).trim();
    if (/^\d+$/.test(s)) {
      switch (Number(s)) {
        case 1: return 'In Use';
        case 2: return 'Maintenance';
        case 3: return 'Transferred';
        case 4: return 'Disposed';
        default: return 'In Use';
      }
    }
    if (s.toLowerCase().includes('maint')) return 'Maintenance';
    if (s.toLowerCase().includes('trans')) return 'Transferred';
    return 'In Use';
  }

  private getDefaultImage(category?: string): string {
    if (!category) return '';
    if (category.toLowerCase().includes('laptop')) return 'https://tse2.mm.bing.net/th/id/OIP.7L_Ho2CVPF-m88H7_UoM3AHaFS?pid=Api&P=0&h=220';
    if (category.toLowerCase().includes('device')) return 'https://tse4.mm.bing.net/th/id/OIP.sJPzc8VZD1qRzKUvudISdwHaFj?pid=Api&P=0&h=220';
    return 'https://tse3.mm.bing.net/th/id/OIP.n1PgBAsks9Nsp78Q3NvXngHaHa?pid=Api&P=0&h=220';
  }

  selectAsset(asset: Asset): void {
    
    this.selectedAsset.set(asset);
  }

  goBack(): void {
    // Navigate back to previous page
    this.selectedAsset.set(null);
  }

  viewAsset(asset: Asset): void {
    this.selectedAsset.set(asset);
  }

  // Filtered assets computed
  filteredAssets = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const cat = this.selectedCategory();
    const stat = this.selectedStatus();

    return this.assets().filter(asset => {
      const categoryMatch = cat === 'all' || asset.category === cat;
      const statusMatch = stat === 'all' || asset.status === stat;
      const searchMatch = !query ||
        (asset.name || '').toLowerCase().includes(query) ||
        (asset.assetTag || '').toLowerCase().includes(query) ||
        (asset.id || '').toLowerCase().includes(query) ||
        (asset.serialNumber || '').toLowerCase().includes(query);

      return categoryMatch && statusMatch && searchMatch;
    });
  });

  getAssetStatusClass(status: string): string {
    return (status || '').toLowerCase().replace(' ', '-');
  }

  totalPages = computed(() => {
    return Math.ceil(this.filteredAssets().length / this.itemsPerPage()) || 1;
  });

  pageNumbers = computed(() => {
    const pages = [];
    for (let i = 1; i <= this.totalPages(); i++) {
      pages.push(i);
    }
    return pages;
  });

  paginatedAssets = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
    const endIndex = startIndex + this.itemsPerPage();
    return this.filteredAssets().slice(startIndex, endIndex);
  });

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  // Filter methods
  toggleCategoryMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.showCategoryMenu.set(!this.showCategoryMenu());
    if (this.showCategoryMenu()) {
      this.showStatusMenu.set(false);
    }
  }

  toggleStatusMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.showStatusMenu.set(!this.showStatusMenu());
    if (this.showStatusMenu()) {
      this.showCategoryMenu.set(false);
    }
  }

  // Setters for filter selections
  setFilterCategory(val: string): void {
    this.selectedCategory.set(val);
    this.currentPage.set(1);
    this.showCategoryMenu.set(false);
  }

  setFilterStatus(val: string): void {
    this.selectedStatus.set(val);
    this.currentPage.set(1);
    this.showStatusMenu.set(false);
  }

  onSearchChange(event: any): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value || '');
    this.currentPage.set(1);
  }
}
