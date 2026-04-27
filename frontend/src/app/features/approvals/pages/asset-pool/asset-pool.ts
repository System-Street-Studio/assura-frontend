import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AssetPoolService, PoolAsset } from '../../services/asset-pool.service';
import { RequestService } from '../../services/requests.service';
import { TransferService } from '../../services/transfer.service';
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
  private assetPoolService = inject(AssetPoolService);
  private requestService = inject(RequestService);
  private transferService = inject(TransferService);

  // Transfer request selection
  approvedTransferRequests = signal<any[]>([]);
  selectedTransferRequest = signal<any>(null);

  // Loading state
  isLoading = signal(true);
  errorMessage = signal('');
  

  // Search and filter signals
  searchQuery = signal<string>('');
  selectedCategory = signal<string>('');
  selectedBrand = signal<string>('');
  selectedSpecification = signal<string>('');
  specificationValue = signal<string>('');
  selectedDivision = signal<string>('');
  selectedEmployee = signal<string>('');

  // Pagination signals
  currentPage = signal(1);
  itemsPerPage = signal(10);

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
      specifications: ['print_speed', 'resolution', 'connectivity', 'paper_size', 'duplex']
    },
    'Servers': {
      brands: ['Dell', 'HP', 'IBM', 'Lenovo', 'Supermicro', 'Cisco'],
      specifications: ['processor', 'ram', 'storage', 'raid', 'power_supply']
    },
    'Mobile Devices': {
      brands: ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Huawei'],
      specifications: ['screen_size', 'storage', 'ram', 'camera', 'battery']
    },
    'Audio/Video': {
      brands: ['Sony', 'Bose', 'JBL', 'LG', 'Samsung', 'Panasonic'],
      specifications: ['power', 'connectivity', 'frequency_response', 'channels', 'format']
    },
    'Office Equipment': {
      brands: ['Canon', 'Brother', 'Xerox', 'HP', 'Epson', 'Ricoh'],
      specifications: ['speed', 'resolution', 'paper_capacity', 'connectivity', 'functions']
    }
  };

  // Data signals
  private allAssets = signal<Asset[]>([]);
  divisions = signal<Division[]>([]);

  // Computed properties for filter options
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
    // Check if there are active filters
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
    
    // Start with all assets - show them by default
    let filtered = this.allAssets();
    
    // Only apply filters if they are active
    if (!hasSearch && !hasCategory && !hasDivision && !hasEmployee) {
      console.log('No active filters - showing all assets:', filtered.length);
      return filtered; // Show all assets when no filters are active
    }

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

  // Computed signal for display - show assets by default or when filtered
  displayAssets = computed(() => {
    // Show all assets by default, or filtered results when filters are active
    return this.filteredResults();
  });

  // Computed properties for filter options
  uniqueEmployees = computed(() => {
    const assets = this.allAssets();
    const employees = new Map<string, { id: string; name: string }>();
    
    assets.forEach(asset => {
      if (asset.assignedUserId && asset.assignedUserName) {
        employees.set(asset.assignedUserId.toString(), {
          id: asset.assignedUserId.toString(),
          name: asset.assignedUserName
        });
      }
    });
    
    return Array.from(employees.values());
  });

  /**
   * Handle dropdown selection change
   */
  onDropdownChange(event: any) {
    
    // Convert event to number for proper ID matching
    const eventId = Number(event);
    console.log(' Event converted to number:', eventId);
    
    const selectedRequest = this.approvedTransferRequests().find(req => req.id === eventId);
    console.log(' Found selected request:', selectedRequest);
    
    this.selectedTransferRequest.set(selectedRequest);
    console.log('selectedTransferRequest signal set to:', this.selectedTransferRequest());
   
  }

  /**
   * Test method to manually select first request
   */
  testSelectFirstRequest() {
    console.log(' Test: Manually selecting first request...');
    
    
    if (this.approvedTransferRequests().length > 0) {
      const firstRequest = this.approvedTransferRequests()[0];
      console.log(' Selecting first request:', firstRequest);
      
      this.selectedTransferRequest.set(firstRequest);
      console.log('selectedTransferRequest signal value after setting:', this.selectedTransferRequest());
    } else {
      console.log(' No requests available to select');
    }
  }

  

  loadApprovedTransferRequests() {
    
    // Use the exact same method as requests-page
    const isDivisionHead = true; // Same as requests-page
    
    this.requestService.getAllRequests(isDivisionHead).subscribe({
      next: (allData: any[]) => {
      
        
        // Filter for transfer requests (same logic as requests-page)
        const transferFiltered = allData.filter(r => r.type?.toLowerCase() === 'transfer');
        
        // Further filter for approved status only
        const approvedTransferRequests = transferFiltered.filter(r => r.status === 'Approved');

        
        // Convert to dropdown format
        const dropdownData = approvedTransferRequests.map(request => ({
          id: request.id,
          requesterName: request.name,
          requesterId: request.requesterId,
          assetName: request.assetName,
          requestType: request.type,
          status: request.status,
          reason: request.reason
        }));
        
        this.approvedTransferRequests.set(dropdownData);
        console.log(' approvedTransferRequests signal after setting:', this.approvedTransferRequests());
      },
      error: (error: any) => {
        console.error(' ERROR: Error loading approved transfer requests:', error);
        this.approvedTransferRequests.set([]);
      }
    });
  }

  
  

  /**
   * Select asset for transfer - pass asset ID and selected request ID to backend
   */
  selectForTransfer(asset: Asset) {
    const selectedRequest = this.selectedTransferRequest();
    if (!selectedRequest) {
      alert('Please select a transfer request from dropdown first.');
      return;
    }
    
    if (confirm(`Select "${asset.productName || asset.assetCode}" for transfer?`)) {
      // Only pass asset ID and request ID to backend
      const transferRequest = {
        assetId: Number(asset.id),
        assetRequestId: selectedRequest.id
      };
      
      console.log('📋 === PASSING IDS TO BACKEND ===');
      console.log('🆔 Asset ID:', Number(asset.id));
      console.log('🆔 Request ID:', selectedRequest.id);
      console.log('📤 Transfer Request Object:', transferRequest);
      console.log('🌐 Sending to backend URL: http://localhost:5000/api/transfers');
      
      // Call backend to create transfer record with just the IDs
      this.transferService.createTransferRecord(transferRequest).subscribe({
        next: (response: any) => {
          console.log('✅ Transfer record created successfully:', response);
          alert('Transfer record created successfully');
        },
        error: (error: any) => {
          console.error('❌ Error creating transfer record:', error);
          alert('Failed to create transfer record. Please try again.');
        }
      });
    }
  }

  /**
   * Load data from API on component init
   */
  ngOnInit() {
    
    
    // Load approved transfer requests for dropdown
    this.loadApprovedTransferRequests();
   

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
        this.divisions.set(data.divisions || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading asset pool data:', err);
        this.errorMessage.set('Failed to load asset data. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Extract category from product name
   */
  extractCategoryFromProductName(productName: string): string {
    const name = productName.toLowerCase();
    
    if (name.includes('laptop') || name.includes('desktop') || name.includes('computer') || name.includes('pc')) {
      return 'Computers';
    }
    if (name.includes('chair') || name.includes('desk') || name.includes('table') || name.includes('cabinet')) {
      return 'Furniture';
    }
    if (name.includes('router') || name.includes('switch') || name.includes('modem') || name.includes('access point')) {
      return 'Network Equipment';
    }
    if (name.includes('printer') || name.includes('scanner') || name.includes('copier')) {
      return 'Printers';
    }
    if (name.includes('server') || name.includes('rack') || name.includes('nas')) {
      return 'Servers';
    }
    if (name.includes('phone') || name.includes('tablet') || name.includes('mobile')) {
      return 'Mobile Devices';
    }
    if (name.includes('camera') || name.includes('projector') || name.includes('tv')) {
      return 'Audio/Video';
    }
    
    return 'Office Equipment';
  }

  /**
   * Reset specification filters
   */
  resetSpecificationFilters() {
    this.selectedSpecification.set('');
    this.specificationValue.set('');
    this.currentPage.set(1);
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
    const pages: number[] = [];
    const totalPages = this.totalPages();
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  onCategoryChange(category: string) {
    this.selectedCategory.set(category);
    this.currentPage.set(1); // Reset to first page when category changes
  }
}

