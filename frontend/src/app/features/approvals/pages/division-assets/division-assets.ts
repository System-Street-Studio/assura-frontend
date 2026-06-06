import { Component, signal, computed, OnInit, OnDestroy, inject, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AssetService } from '../../../../features/inventory/services/asset.service';
import { DivisionHeadDashboardService } from '../../services/division-head-dashboard.service';

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
}

@Component({
  selector: 'app-division-assets',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule, FormsModule],
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
  
  // Asset counts for real data
  totalAssets = computed(() => this.assets().length);
  inUseAssets = computed(() => this.assets().filter(asset => asset.status === 'In Use').length);
  maintenanceAssets = computed(() => this.assets().filter(asset => asset.status === 'Maintenance').length);
  transferredAssets = computed(() => this.assets().filter(asset => asset.status === 'Transferred').length);

  ngOnInit(): void {
  
    this.loadDivisionAssets();
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
        const mappedAssets: Asset[] = data.map(a => ({
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
          divisionId: a.divisionId?.toString() || undefined
        }));

        this.assets.set(mappedAssets);
        this.dashboardService.updateAssetCount(mappedAssets.length);
        const categories = [...new Set(mappedAssets.map(a => a.category))];
        this.availableCategories.set(categories);

        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
<<<<<<< HEAD
  private mapAssetStatus(backendStatus: any): Asset['status'] {
    if (backendStatus === null || backendStatus === undefined) return 'In Use';
    const s = String(backendStatus).trim();
    if (/^\d+$/.test(s)) {
      switch (Number(s)) {
        case 1: return 'In Use';
        case 2: return 'Maintenance';
        case 3: return 'Transferred';
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
=======
 
  private mapAssetStatus(backendStatus: any): Asset['status'] {
    const statusStr = backendStatus.toString();
    
    if (statusStr === 'Maintenance' || statusStr === '2') return 'Maintenance';
    if (statusStr === 'Transferred' || statusStr === '3') return 'Transferred';
    
    
    return 'In Use';
  }
  
>>>>>>> feature/division-head-part

  selectAsset(asset: Asset): void {
    console.log('Selected asset:', asset);
    this.selectedAsset.set(asset);
  }

  viewAsset(asset: Asset): void {
    this.selectedAsset.set(asset);
  }

<<<<<<< HEAD
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
        (asset.id || '').toLowerCase().includes(query);

      return categoryMatch && statusMatch && searchMatch;
    });
  });

  getAssetStatusClass(status: string): string {
    return (status || '').toLowerCase().replace(' ', '-');
  }
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
    this.showCategoryMenu.set(false);
  }

  setFilterStatus(val: string): void {
    this.selectedStatus.set(val);
    this.showStatusMenu.set(false);
  }

  onSearchChange(event: any): void {
    this.searchQuery.set(event.target.value);
  }

<<<<<<< HEAD
  filteredAssets = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const cat = this.selectedCategory();
    const stat = this.selectedStatus();

    return this.assets().filter(asset => {
      const categoryMatch = cat === 'all' || asset.category === cat;
      const statusMatch = stat === 'all' || asset.status === stat;
      const searchMatch = !query || 
                          asset.name.toLowerCase().includes(query) || 
                          asset.id.toLowerCase().includes(query);
      
      return categoryMatch && statusMatch && searchMatch;
    });
  });

  getAssetStatusClass(status: string): string {
    return status.toLowerCase().replace(' ', '-');
  }
=======
>>>>>>> feature/division-head-part
}
