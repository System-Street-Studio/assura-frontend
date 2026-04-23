import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AssetPoolService, PoolAsset } from '../../services/asset-pool.service';
import { Division } from '../../../inventory/models/division.model';

interface Asset extends PoolAsset {
  assignedTo?: string;
  empId?: string;
  displayName?: string;
  specifications?: string;
}

interface CategoryConfig {
  brands: string[];
  specifications: string[];
}

@Component({
  selector: 'app-asset-pool',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './asset-pool.html',
  styleUrl: './asset-pool.css'
})
export class AssetPoolComponent implements OnInit {
  private router = inject(Router);
  private assetPoolService = inject(AssetPoolService);

  // Loading state
  isLoading = signal(true);
  errorMessage = signal('');

  // Category to Brand mapping - Enhanced for all asset types
  categoryBrandMap: Record<string, CategoryConfig> = {
    'Computers': {
      brands: ['Dell', 'HP', 'Lenovo', 'Apple', 'ASUS', 'Acer', 'Microsoft'],
      specifications: ['processor', 'ram', 'storage', 'graphics', 'screen_size']
    },
    'Furniture': {
      brands: ['IKEA', 'Herman Miller', 'Steelcase', 'Hon', 'Office Depot', 'Wayfair'],
      specifications: ['dimensions', 'material', 'color', 'capacity', 'adjustable']
    },
    'Network Equipment': {
      brands: ['Cisco', 'Juniper', 'Netgear', 'TP-Link', 'Linksys', 'Ubiquiti'],
      specifications: ['ports', 'speed', 'protocol', 'wireless', 'managed']
    },
    'Printers': {
      brands: ['HP', 'Canon', 'Epson', 'Brother', 'Xerox', 'Samsung'],
      specifications: ['type', 'speed', 'resolution', 'connectivity', 'duplex']
    },
    'Servers': {
      brands: ['Dell', 'HP', 'IBM', 'Lenovo', 'Supermicro', 'Cisco'],
      specifications: ['processor', 'ram', 'storage', 'rack_size', 'power_supply']
    },
    'Mobile Devices': {
      brands: ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Huawei'],
      specifications: ['screen_size', 'storage', 'camera', 'battery', 'processor']
    },
    'Audio/Video': {
      brands: ['Sony', 'Bose', 'JBL', 'Logitech', 'Sennheiser', 'Shure'],
      specifications: ['type', 'power', 'connectivity', 'frequency_range', 'channels']
    },
    'Office Equipment': {
      brands: ['Xerox', 'Canon', 'Brother', 'HP', 'Ricoh', 'Konica Minolta'],
      specifications: ['type', 'speed', 'capacity', 'function', 'paper_size']
    }
  };

  // Divisions list - will be fetched from API
  divisions = signal<Division[]>([]);

  // Filters signals
  searchQuery = signal('');
  selectedCategory = signal(''); // Default to empty to not show results initially
  selectedBrand = signal('');
  selectedDivision = signal('');
  selectedEmployee = signal('');
  selectedSpecification = signal('');
  specificationValue = signal('');

  // Pagination signals
  currentPage = signal(1);
  itemsPerPage = signal(10);

  // Master Data List - will be fetched from API
  allAssets = signal<Asset[]>([]);

  // Computed signals
  availableBrands = computed(() => {
    const config = this.categoryBrandMap[this.selectedCategory()];
    return config ? config.brands : [];
  });

  availableSpecifications = computed(() => {
    const config = this.categoryBrandMap[this.selectedCategory()];
    return config ? config.specifications : [];
  });

  // Computed property for filtered results (before pagination)
  filteredResults = computed(() => {
    // Only show assets if there's a search query or active filters
    const hasSearch = this.searchQuery().trim() !== '';
    const hasCategory = this.selectedCategory() !== '';
    const hasDivision = this.selectedDivision() !== '';
    const hasEmployee = this.selectedEmployee() !== '';
    
    console.log('Filter conditions:', { 
      hasSearch, 
      hasCategory, 
      hasDivision, 
      hasEmployee, 
      searchQuery: this.searchQuery(),
      allAssetsCount: this.allAssets().length 
    });
    
    if (!hasSearch && !hasCategory && !hasDivision && !hasEmployee) {
      return []; // Don't show any assets unless searching or filtering
    }

    let filtered = this.allAssets();

    // Enhanced search query filtering
    const q = this.searchQuery().toLowerCase();
    if (q) {
      console.log('Searching for:', q);
      filtered = filtered.filter(asset =>
        (asset.productName?.toLowerCase().includes(q) || false) ||
        (asset.assetTag?.toLowerCase().includes(q) || false) ||
        (asset.assetCode?.toLowerCase().includes(q) || false) ||
        (asset.serialNumber?.toLowerCase().includes(q) || false) ||
        (asset.divisionName?.toLowerCase().includes(q) || false) ||
        (asset.assignedUserId?.toString().includes(q) || false) ||
        (asset.assignedUserName?.toLowerCase().includes(q) || false) ||
        (asset.specifications?.toLowerCase().includes(q) || false)
      );
    }

    // Filter by category
    if (this.selectedCategory()) {
      const selectedCat = this.selectedCategory().toLowerCase();
      console.log('Filtering by category:', selectedCat);
      const beforeCount = filtered.length;
      filtered = filtered.filter(asset => {
        const assetCategory = (asset.categoryName || 'Unknown').toLowerCase();
        const matches = assetCategory === selectedCat || 
               assetCategory.includes(selectedCat) ||
               selectedCat.includes(assetCategory) ||
               (asset.productName && asset.productName.toLowerCase().includes(selectedCat));
        console.log(`Asset "${asset.productName}" category "${assetCategory}" matches "${selectedCat}": ${matches}`);
        return matches;
      });
      console.log(`Category filter: ${beforeCount} -> ${filtered.length} assets`);
    }

    // Filter by brand
    if (this.selectedBrand()) {
      filtered = filtered.filter(asset => 
        asset.productName && asset.productName.toLowerCase().includes(this.selectedBrand().toLowerCase())
      );
    }

    // Filter by division
    if (this.selectedDivision()) {
      filtered = filtered.filter(asset => asset.divisionName === this.selectedDivision());
    }

    // Filter by employee
    if (this.selectedEmployee()) {
      filtered = filtered.filter(asset =>
        asset.assignedUserId?.toString().includes(this.selectedEmployee()) ||
        (asset.assignedUserName?.toLowerCase().includes(this.selectedEmployee().toLowerCase()) || false)
      );
    }

    // Filter by specification
    if (this.selectedSpecification() && this.specificationValue()) {
      const spec = this.selectedSpecification().toLowerCase();
      const value = this.specificationValue().toLowerCase();
      filtered = filtered.filter(asset => {
        return (asset.specifications && 
                asset.specifications.toLowerCase().includes(spec) && 
                asset.specifications.toLowerCase().includes(value));
      });
    }

    console.log('Final filtered assets:', filtered.length);
    return filtered;
  });

  // Pagination computed properties
  totalPages = computed(() => {
    const filtered = this.filteredResults();
    const maxResults = Math.min(filtered.length, 50);
    return Math.ceil(maxResults / this.itemsPerPage());
  });

  paginatedAssets = computed(() => {
    const filtered = this.filteredResults();
    const maxResults = Math.min(filtered.length, 50);
    const limitedResults = filtered.slice(0, maxResults);
    
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
    const endIndex = Math.min(startIndex + this.itemsPerPage(), maxResults);
    
    return limitedResults.slice(startIndex, endIndex);
  });

  // Computed signal for display - only show results when there's a search query or filters
  displayAssets = computed(() => {
    // Only show assets if there's a search query or active filters
    const hasSearch = this.searchQuery().trim() !== '';
    const hasCategory = this.selectedCategory() !== '';
    const hasDivision = this.selectedDivision() !== '';
    const hasEmployee = this.selectedEmployee() !== '';
    
    console.log('Filter conditions:', { 
      hasSearch, 
      hasCategory, 
      hasDivision, 
      hasEmployee, 
      searchQuery: this.searchQuery(),
      allAssetsCount: this.allAssets().length 
    });
    
    if (!hasSearch && !hasCategory && !hasDivision && !hasEmployee) {
      return []; // Don't show any assets unless searching or filtering
    }

    let filtered = this.allAssets();

    // Enhanced search query filtering (name, empId, assignedTo, asset tag, division, etc.)
    const q = this.searchQuery().toLowerCase();
    if (q) {
      console.log('Searching for:', q);
      filtered = filtered.filter(asset =>
        (asset.productName?.toLowerCase().includes(q) || false) ||
        (asset.assetTag?.toLowerCase().includes(q) || false) ||
        (asset.assetCode?.toLowerCase().includes(q) || false) ||
        (asset.serialNumber?.toLowerCase().includes(q) || false) ||
        (asset.divisionName?.toLowerCase().includes(q) || false) ||
        (asset.assignedUserId?.toString().includes(q) || false) ||
        (asset.assignedUserName?.toLowerCase().includes(q) || false) ||
        (asset.specifications?.toLowerCase().includes(q) || false)
      );
    }

    // Filter by category
    if (this.selectedCategory()) {
      const selectedCat = this.selectedCategory().toLowerCase();
      console.log('Filtering by category:', selectedCat);
      const beforeCount = filtered.length;
      filtered = filtered.filter(asset => {
        const assetCategory = (asset.categoryName || 'Unknown').toLowerCase();
        const matches = assetCategory === selectedCat || 
               assetCategory.includes(selectedCat) ||
               selectedCat.includes(assetCategory) ||
               (asset.productName && asset.productName.toLowerCase().includes(selectedCat));
        console.log(`Asset "${asset.productName}" category "${assetCategory}" matches "${selectedCat}": ${matches}`);
        return matches;
      });
      console.log(`Category filter: ${beforeCount} -> ${filtered.length} assets`);
    }

    // Filter by brand
    if (this.selectedBrand()) {
      filtered = filtered.filter(asset => 
        asset.productName && asset.productName.toLowerCase().includes(this.selectedBrand().toLowerCase())
      );
    }

    // Filter by division
    if (this.selectedDivision()) {
      filtered = filtered.filter(asset => asset.divisionName === this.selectedDivision());
    }

    // Filter by employee
    if (this.selectedEmployee()) {
      filtered = filtered.filter(asset =>
        asset.assignedUserId?.toString().includes(this.selectedEmployee()) ||
        (asset.assignedUserName?.toLowerCase().includes(this.selectedEmployee().toLowerCase()) || false)
      );
    }

    // Filter by specification
    if (this.selectedSpecification() && this.specificationValue()) {
      const spec = this.selectedSpecification().toLowerCase();
      const value = this.specificationValue().toLowerCase();
      filtered = filtered.filter(asset => {
        return (asset.specifications && 
                asset.specifications.toLowerCase().includes(spec) && 
                asset.specifications.toLowerCase().includes(value));
      });
    }

    console.log('Final filtered assets:', filtered.length);
    
    // Apply pagination - limit to maximum 50 results
    const maxResults = Math.min(filtered.length, 50);
    const limitedResults = filtered.slice(0, maxResults);
    
    // Calculate pagination
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
    const endIndex = Math.min(startIndex + this.itemsPerPage(), maxResults);
    
    const finalResults = limitedResults.slice(startIndex, endIndex);
    console.log('Final paginated results:', finalResults.length, 'items:', finalResults.map(a => ({name: a.productName, category: a.categoryName})));
    
    return finalResults;
  });

  // Keep filteredAssets for compatibility but make it use paginated results
  filteredAssets = this.paginatedAssets;

  uniqueEmployees = computed(() => {
    const employees = this.allAssets()
      .filter(a => a.assignedUserId && a.assignedUserName)
      .map(a => ({ name: a.assignedUserName || '', id: a.assignedUserId?.toString() || '' }));
    
    const unique = Array.from(
      new Map(employees.map(e => [e.id, e])).values()
    );
    return unique;
  });

  /**
   * Extract category from product name using predefined category mappings
   */
  extractCategoryFromProductName(productName: string): string {
    if (!productName) return 'Unknown';
    
    const name = productName.toLowerCase();
    
    // Check for category keywords in product name
    for (const [category, config] of Object.entries(this.categoryBrandMap)) {
      for (const brand of config.brands) {
        if (name.includes(brand.toLowerCase())) {
          return category;
        }
      }
      // Also check for category keywords
      if (name.includes(category.toLowerCase())) {
        return category;
      }
    }
    
    // Default categorization based on common keywords
    if (name.includes('laptop') || name.includes('dell') || name.includes('hp') || name.includes('lenovo')) {
      return 'Computers';
    }
    if (name.includes('printer') || name.includes('xerox') || name.includes('canon')) {
      return 'Printers';
    }
    if (name.includes('server') || name.includes('rack')) {
      return 'Servers';
    }
    if (name.includes('router') || name.includes('switch') || name.includes('cisco')) {
      return 'Network Equipment';
    }
    if (name.includes('phone') || name.includes('tablet')) {
      return 'Mobile Devices';
    }
    if (name.includes('desk') || name.includes('chair') || name.includes('table')) {
      return 'Furniture';
    }
    if (name.includes('camera') || name.includes('projector') || name.includes('tv')) {
      return 'Audio/Video';
    }
    
    return 'Office Equipment';
  }

  /**
   * Load data from API on component init
   */
  ngOnInit() {
    this.assetPoolService.getAssetPoolData().subscribe({
      next: (data) => {
        console.log('Raw API data:', data);
        console.log('Number of assets from API:', data.assets?.length || 0);
        
        // Process assets
        const transformedAssets = data.assets.map(asset => {
          // Extract category from product name using the categoryBrandMap
          const categoryName = this.extractCategoryFromProductName(asset.productName || '');
          
          console.log(`Asset "${asset.productName}" categorized as: ${categoryName}`);
          
          return {
            ...asset,
            assignedTo: asset.assignedUserName || 'Unassigned',
            empId: asset.assignedUserId?.toString() || '',
            displayName: asset.productName || asset.assetCode || 'Unknown',
            specifications: asset.notes || 'N/A',
            categoryName: categoryName // Set the extracted category
          };
        });

        console.log('Transformed assets:', transformedAssets);
        this.allAssets.set(transformedAssets);
        
        // Set divisions - extract unique division names
        const divisionNames = Array.from(
          new Set(transformedAssets.map(a => a.divisionName).filter(d => d))
        ) as string[];
        
        const divisionObjects: Division[] = divisionNames.map((name, index) => ({
          id: index,
          name: name
        }));

        this.divisions.set(divisionObjects);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading asset pool data:', error);
        this.errorMessage.set('Failed to load assets. Please try again later.');
        this.isLoading.set(false);
      }
    });
  }

  onCategoryChange(category: string) {
    this.selectedCategory.set(category);
    this.selectedBrand.set('');
    this.selectedSpecification.set('');
    this.specificationValue.set('');
    this.currentPage.set(1); // Reset to first page when category changes
  }

  /**
   * Create a transfer request for the selected asset
   * This will send the asset to the employee's incoming requests
   */
  putTransferRequest(asset: Asset) {
    console.log('Transfer request for asset:', asset);
    // TODO: Implement transfer request dialog
    alert('Transfer request functionality will be implemented');
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  onPreviousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  onNextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  getPageNumbers(): number[] {
    // Note: totalPages and paginatedAssets are updated by computed property
    // No need to set signals here to avoid NG0600 error
    const total = this.totalPages();
    const current = this.currentPage();
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}