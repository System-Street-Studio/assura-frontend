import { Component, signal, computed, OnInit, OnDestroy, inject, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../../../core/services/profile.service';
import { AssetService } from '../../../../features/inventory/services/asset.service';

interface Asset {
  id: string;
  name: string;
  status: 'Maintenance' | 'In Use' | 'Transferred';
  category: string;
  division: string;
  assignedUserName: string;
  assetTag: string;
  specs: string;
  image: string;
  assignedUserId?: string;
  divisionId?: string;
}

@Component({
  selector: 'app-division-assets',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule, FormsModule],
  templateUrl: './division-assets.html',
  styleUrls: ['./division-assets.css']
})
export class DivisionAssetsComponent implements OnInit, OnDestroy {
  private profileService = inject(ProfileService);
  private assetService = inject(AssetService);

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
  transferredAssets = computed(() => this.assets().filter(asset => asset.status === 'Transferred'));

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
          id: a.id.toString(),
          name: a.productName || 'N/A',
          category: a.categoryName || 'General',
          division: a.divisionName || 'N/A',
          status: this.mapAssetStatus(a.status), 
          assetTag: a.assetTag || 'NO-TAG',
          assignedUserName: a.assignedUserName || 'Not Assigned',
          assignedUserId: a.assignedUserId?.toString(),
          
          specs: a.notes || 'No details available', 
          image: 'assets/images/placeholder-asset.png' 
        }));

        this.assets.set(mappedAssets);
        
       
        const categories = [...new Set(mappedAssets.map(a => a.category))];
        this.availableCategories.set(categories);
        
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set("දත්ත ලබාගැනීමට අපොහොසත් විය.");
        this.isLoading.set(false);
      }
    });
  }

 
  private mapAssetStatus(backendStatus: any): Asset['status'] {
    const statusStr = backendStatus.toString();
    
    if (statusStr === 'Maintenance' || statusStr === '2') return 'Maintenance';
    if (statusStr === 'Transferred' || statusStr === '3') return 'Transferred';
    
    
    return 'In Use';
  }
  

  selectAsset(asset: Asset): void {
    console.log('Selected asset:', asset);
    this.selectedAsset.set(asset);
  }

  goBack(): void {
    // Navigate back to previous page
    window.history.back();
  }

  viewAsset(asset: Asset): void {
    console.log('Selected asset:', asset);
    this.selectedAsset.set(asset);
  }


  // Filter methods for different asset types
  filteredAssets = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const cat = this.selectedCategory();
    const stat = this.selectedStatus();

    return this.assets().filter(asset => {
      const categoryMatch = cat === 'all' || asset.category === cat;
      const statusMatch = stat === 'all' || asset.status === stat;
      const searchMatch = !query || 
                          asset.name.toLowerCase().includes(query) || 
                          asset.assetTag.toLowerCase().includes(query);
      
      return categoryMatch && statusMatch && searchMatch;
    });
  });
  
  // Filter methods
  toggleCategoryMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.showCategoryMenu.set(!this.showCategoryMenu());
    // Close other menu when opening this one
    if (this.showCategoryMenu()) {
      this.showStatusMenu.set(false);
    }
  }

  toggleStatusMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.showStatusMenu.set(!this.showStatusMenu());
    // Close other menu when opening this one
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

}
