import { Component, signal, computed, OnInit, OnDestroy, inject, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AssetPoolService } from '../../services/asset-pool.service';
import { ProfileService } from '../../../../core/services/profile.service';

interface Asset {
  id: string;
  name: string;
  type: string;
  status: string;
  assignedTo: string;
  image: string;
  specs: string;
  category: string;
  division: string;
  condition: string;
  assignedUserId?: string;
  assignedUserName?: string;
  assetTag?: string;
  divisionId?: string;
  divisionName?: string;
}

@Component({
  selector: 'app-division-assets',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule, FormsModule],
  templateUrl: './division-assets.html',
  styleUrls: ['./division-assets.css']
})
export class DivisionAssetsComponent implements OnInit, OnDestroy {
  private assetPoolService = inject(AssetPoolService);
  private profileService = inject(ProfileService);
  private elementRef = inject(ElementRef);

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
    console.log('=== DIVISION ASSETS PAGE INITIALIZED ===');
    
    // Add global click listener for closing dropdowns
    document.addEventListener('click', this.handleGlobalClick.bind(this));
    
    // Load profile first, then assets
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        console.log('Profile loaded:', profile);
        this.loadDivisionAssets();
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.errorMessage.set('Failed to load user profile');
        this.isLoading.set(false);
      }
    });
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
    console.log('Loading division assets from backend...');
    this.isLoading.set(true);
    this.errorMessage.set('');

    // Get current user profile to determine their division
    const currentProfile = this.profileService.profile();
    
    if (!currentProfile || !currentProfile.divisionId) {
      console.error('User profile or division information not available');
      this.errorMessage.set('User division information not available');
      this.isLoading.set(false);
      return;
    }

    console.log('Current user division:', currentProfile.divisionName, 'ID:', currentProfile.divisionId);

    this.assetPoolService.getAllAssignedAssets().subscribe({
      next: (assets: any[]) => {
        console.log('All assets loaded from backend:', assets);
        
        // Filter assets by current user's division
        const divisionAssets = assets.filter(asset => {
          return asset.divisionId === currentProfile.divisionId || 
                 asset.divisionName === currentProfile.divisionName;
        });

        console.log('Filtered assets for division:', divisionAssets);
        
        // Transform backend data to Asset interface
        const transformedAssets: Asset[] = divisionAssets.map(asset => ({
          id: asset.id?.toString() || asset.assetId?.toString() || '',
          name: asset.productName || asset.assetName || asset.name || '',
          type: asset.category || asset.assetType || '',
          status: this.mapAssetStatus(asset.status),
          assignedTo: asset.assignedUserName || asset.assignedTo || 'Unassigned',
          image: asset.image || asset.assetImage || asset.imageUrl || asset.photo || this.getDefaultImage(asset.categoryName),
          specs: asset.specs || asset.description || '',
          category: asset.categoryName || asset.category || '',
          division: asset.divisionName || asset.division || '',
          condition: asset.condition || 'Good',
          assignedUserId: asset.assignedUserId?.toString() || '',
          assignedUserName: asset.assignedUserName || '',
          assetTag: asset.assetTag || asset.assetCode || '',
          divisionId: asset.divisionId?.toString() || '',
          divisionName: asset.divisionName || ''
        }));

        this.assets.set(transformedAssets);
        
        // Extract unique categories from the assets
        const uniqueCategories = [...new Set(transformedAssets.map(asset => asset.category).filter(cat => cat && cat.trim() !== ''))];
        this.availableCategories.set(uniqueCategories);
        
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading assets:', error);
        this.errorMessage.set('Failed to load assets');
        this.isLoading.set(false);
      }
    });
  }

  private mapAssetStatus(status: any): string {
    if (typeof status === 'number') {
      switch (status) {
        case 0: return 'Disconnected';
        case 1: return 'In Use';
        case 2: return 'Maintenance';
        case 3: return 'Transferred';
        case 4: return 'Disposed';
        default: return 'In Use';
      }
    }
    
    const statusStr = String(status || 'In Use');
    const statusMap: { [key: string]: string } = {
      'In Use': 'In Use',
      'Maintenance': 'Maintenance',
      'Transferred': 'Transferred',
      'Available': 'In Use',
      'Assigned': 'In Use'
    };
    return statusMap[statusStr] || 'In Use';
  }

  private getDefaultImage(category: string): string {
    if (category?.toLowerCase().includes('laptop')) return 'https://tse2.mm.bing.net/th/id/OIP.7L_Ho2CVPF-m88H7_UoM3AHaFS?pid=Api&P=0&h=220';
    if (category?.toLowerCase().includes('device')) return 'https://tse4.mm.bing.net/th/id/OIP.sJPzc8VZD1qRzKUvudISdwHaFj?pid=Api&P=0&h=220';
    return 'https://tse3.mm.bing.net/th/id/OIP.n1PgBAsks9Nsp78Q3NvXngHaHa?pid=Api&P=0&h=220';
  }

  selectAsset(asset: Asset): void {
    console.log('Selected asset:', asset);
    this.selectedAsset.set(asset);
  }

  viewAsset(asset: Asset): void {
    this.selectedAsset.set(asset);
  }

  goBack(): void {
    window.history.back();
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
}
