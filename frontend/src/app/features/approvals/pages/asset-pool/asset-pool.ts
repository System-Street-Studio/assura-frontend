import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AssetPoolService, PoolAsset } from '../../services/asset-pool.service';
import { RequestService } from '../../services/requests.service';
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
   * Load approved transfer requests for dropdown selection
   */
  loadApprovedTransferRequests() {
    console.log('� Using same method as requests-page to get approved transfer requests...');
    
    // Use the same method as requests-page that actually works
    this.requestService.getApprovedTransferRequestsFromAllData().subscribe({
      next: (requests) => {
        console.log('✅ Approved transfer requests loaded using requests-page method:', requests.length);
        this.approvedTransferRequests.set(requests);
      },
      error: (error: any) => {
        console.error('❌ Error loading approved transfer requests:', error);
        this.approvedTransferRequests.set([]);
      }
    });
  }

  /**
   * Fallback method: Get all transfer requests and filter client-side
   */
  tryFallbackMethod() {
    console.log('🔄 Trying fallback method - get all transfer requests...');
    
    this.requestService.getAllTransferRequests().subscribe({
      next: (requests) => {
        console.log('📋 Method 2 - All transfer requests:', requests);
        
        if (requests && requests.length > 0) {
          this.processTransferRequests(requests, 'Method 2');
        } else {
          console.log('⚠️ Method 2 returned no results, trying debug method...');
          this.tryDebugMethod();
        }
      },
      error: (error) => {
        console.error('❌ Method 2 failed, trying debug method:', error);
        this.tryDebugMethod();
      }
    });
  }

  /**
   * Debug method: Get all asset requests to see what exists in database
   */
  tryDebugMethod() {
    console.log('🔍 Trying debug method - get all asset requests...');
    
    this.requestService.getAllAssetRequests().subscribe({
      next: (requests) => {
        console.log('📋 Method 3 - All asset requests:', requests);
        console.log('📊 Total asset requests in database:', requests?.length || 0);
        
        if (requests && requests.length > 0) {
          // Log a few sample requests to understand structure
          console.log('🔍 Sample requests:');
          requests.slice(0, 3).forEach((req, index) => {
            console.log(`  Request ${index + 1}:`, {
              id: req.id,
              assetName: req.assetName,
              requestType: req.requestType || req.type,
              status: req.status,
              requesterName: req.requesterName
            });
          });
          
          // Filter for transfer requests from all requests
          const transferRequests = requests.filter(req => 
            (req.requestType === 'Transfer' || req.type === 'Transfer') && 
            req.status === 'Approved'
          );
          
          console.log('✅ Found transfer requests from all data:', transferRequests);
          this.processTransferRequests(transferRequests, 'Method 3');
        } else {
          console.log('⚠️ No asset requests found in database at all');
          this.approvedTransferRequests.set([]);
        }
      },
      error: (error) => {
        console.error('❌ All methods failed:', error);
        this.approvedTransferRequests.set([]);
      }
    });
  }

  /**
   * Process transfer requests and filter for approved ones
   */
  processTransferRequests(requests: any[], method: string) {
    console.log(`📊 ${method} - Processing ${requests.length} assetrequests records`);
    
    if (!requests || requests.length === 0) {
      console.log('⚠️ No assetrequests records to process');
      this.approvedTransferRequests.set([]);
      return;
    }
    
    // Log first request structure to understand field names
    if (requests.length > 0) {
      console.log(`🔍 ${method} - First assetrequest record structure:`, requests[0]);
      console.log(`🔍 ${method} - Available fields:`, Object.keys(requests[0]));
    }
    
    // Filter for approved status and Transfer requestType
    const approvedRequests = requests.filter(request => {
      const status = request.status || request.Status || request.requestStatus || request.assetStatus;
      const type = request.requestType || request.type || request.Type || request.assetType;
      
      console.log(`🔍 ${method} - Request ID ${request.id}: status="${status}", type="${type}"`);
      
      return status === 'Approved' && (type === 'Transfer' || type === 'transfer');
    });
    
    console.log(`✅ ${method} - Filtered approved assetrequest records:`, approvedRequests);
    console.log(`📊 ${method} - Final count:`, approvedRequests.length, 'approved transfer requests found');
    
    this.approvedTransferRequests.set(approvedRequests);
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
   * Select asset for transfer - use dropdown selected request + asset data to create transfer record
   */
  putTransferRequest(asset: Asset) {
    console.log('Select for transfer button clicked for asset:', asset);
    
    const selectedRequest = this.selectedTransferRequest();
    if (!selectedRequest) {
      console.error('❌ No transfer request selected from dropdown');
      alert('Please select a transfer request from the dropdown first.');
      return;
    }
    
    const assetName = asset.productName || asset.assetCode || 'Unknown Asset';
    const assignedTo = asset.assignedUserName || 'Unknown Employee';
    
    if (confirm(`Select "${assetName}" for transfer from ${assignedTo}?`)) {
      console.log('📋 Using selected transfer request from dropdown:', selectedRequest);
      
      // Prepare asset data from the asset pool
      const assetData = {
        assetId: asset.id,
        assetTag: asset.assetTag || asset.assetCode,
        divisionId: asset.divisionId,
        divisionName: asset.divisionName,
        assignedUserId: asset.assignedUserId,
        assignedUserName: asset.assignedUserName
      };
      
      console.log('📋 Asset data from assets table:', assetData);
      console.log('📄 Selected transfer request data from dropdown:', selectedRequest);
      
      // Create transfer record combining both data sources
      this.requestService.createTransferRecord(assetData, selectedRequest).subscribe({
        next: (response) => {
          console.log('✅ Transfer record created successfully:', response);
          alert('Transfer record created successfully!');
        },
        error: (error) => {
          console.error('❌ Error creating transfer record:', error);
          alert('Failed to create transfer record. Please try again.');
        }
      });
    }
  }

  // Event handlers
  onCategoryChange(category: string) {
    this.selectedCategory.set(category);
    this.selectedBrand.set('');
    this.selectedSpecification.set('');
    this.specificationValue.set('');
    this.currentPage.set(1); // Reset to first page when category changes
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
    const pages: number[] = [];
    const totalPages = this.totalPages();
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }
}

