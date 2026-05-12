import { Component, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { AssetPoolService, PoolAsset } from '../../services/asset-pool.service';
import { RequestService } from '../../services/requests.service';
import { TransferService } from '../../services/transfer.service';
import { AuthService } from '../../../../core/auth/auth.service';


// Interfaces
interface Category { id: number; name: string; }
interface Division { id: number; name: string; }
interface AssetSpecification { id: number; name: string; categoryId: number; }
interface Employee { id: number; fullName: string; email?: string; divisionId?: number; }

interface Asset extends PoolAsset {
  assignedTo?: string;
  empId?: string;
  displayName?: string;
  specifications?: string;
}

@Component({
  selector: 'app-asset-pool',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './asset-pool.html',
  styleUrl: './asset-pool.css'
})
export class AssetPoolComponent implements OnInit, OnDestroy {
  // --- Service Injections ---
  private assetPoolService = inject(AssetPoolService);
  private requestService = inject(RequestService);
  private transferService = inject(TransferService);
  private authService = inject(AuthService);
  // --- RxJS Subjects (Debouncing සඳහා) ---
  private searchSubject = new Subject<string>();
  private specValueSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // --- UI & Loading States ---
  isLoading = signal(true);
  errorMessage = signal('');

  // --- Data Signals ---
  approvedTransferRequests = signal<any[]>([]);
  selectedTransferRequest = signal<any>(null);
  categories = signal<Category[]>([]);
  specifications = signal<AssetSpecification[]>([]);
  divisions = signal<Division[]>([]); // All divisions for dropdown
  
  //
  allAssets = signal<Asset[]>([]); 
  employeesList = signal<{ id: string; name: string }[]>([]); // Unique employees from filtered assets
  allEmployees = signal<Employee[]>([]); // All assignable employees for dropdown

  // --- Filter Signals ---
  searchQuery = signal<string>('');
  selectedCategory = signal<string>('');
  selectedSpecification = signal<string>('');
  selectedDivision = signal<string>('');
  selectedEmployee = signal<string>('');
  specificationValue = signal<string>('');

  // --- Pagination Signals ---
  currentPage = signal(1);
  itemsPerPage = signal(10);
  totalItems = signal(0);

  // --- Computed Properties ---

  categoryNames = computed(() => this.categories().map(c => c.name));

  availableSpecifications = computed(() => {
    const selectedCat = this.selectedCategory();
    if (!selectedCat) return [];
    
    const categoryObj = this.categories().find(c => c.name === selectedCat);
    if (!categoryObj) return [];
    
    return this.specifications()
      .filter(s => s.categoryId === categoryObj.id)
      .map(s => s.name);
  });

 // Calculate total pages based on the number of filtered assets
  totalPages = computed(() => {
    const count = this.totalItems();
    return Math.ceil(count / this.itemsPerPage());
  });

  // Get the assets to display on the current page
  paginatedAssets = computed(() => this.allAssets());

  // --- Lifecycle Hooks ---

  ngOnInit() {

    this.setupDebouncing();
    this.loadDropdownOptions();
    this.loadApprovedTransferRequests();
    this.loadFilteredAssets(); 
  }

  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  // --- Initialization & Setup ---

  private setupDebouncing() {

    // Search input debouncing
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      console.log(' Debounced search triggered:', value);
      this.searchQuery.set(value);
      this.currentPage.set(1);
      this.loadFilteredAssets();
    });

    // Specification value input debouncing
    this.specValueSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      console.log(' Debounced spec value triggered:', value);
      this.specificationValue.set(value);
      this.currentPage.set(1);
      this.loadFilteredAssets();
    });
  }



  private loadDropdownOptions() {

    // Load categories from backend
    this.assetPoolService.getCategories().subscribe({
      next: (cats) => {
        this.categories.set(cats);
      },
      error: (err) => {
        console.error('✗ Failed to load categories:', err);
        this.errorMessage.set('Failed to load categories');
      }
    });

    // Load assigned divisions from backend 
    this.assetPoolService.getAssignedDivisions().subscribe({
      next: (divs) => {
        this.divisions.set(divs);
      },
      error: (err) => {
        console.error('✗ Failed to load assigned divisions:', err);
        this.errorMessage.set('Failed to load divisions');
      }
    });


    // Load assigned employees from backend 
    this.assetPoolService.getAssignedEmployees().subscribe({
      next: (emps) => {
        this.employeesList.set(emps.map(emp => ({ 
          id: emp.id.toString(), 
          name: emp.name 
        })));
      },
      error: (err) => {
        console.error('✗ Failed to load assigned employees:', err);
        this.errorMessage.set('Failed to load employees');
      }
    });

  }


  
  // Load approved transfer requests for dropdown
  loadApprovedTransferRequests() {

    const headId = Number(this.authService.getUserId());
    this.requestService.getApprovedTransferRequests(headId).subscribe({
      next: (requests: any[]) => {
        this.approvedTransferRequests.set(requests);
      },
      error: (err) => {
        console.error('Error loading approved transfer requests:', err);
      }
    });
  }


  // --- Backend Filtering Logic (Core Function) ---

  loadFilteredAssets() {
    this.isLoading.set(true);
    
    const filterParams: any = {
      page: this.currentPage(),
      pageSize: this.itemsPerPage(),
      
    };
    
    // Add optional filters only if they have values
   
  if (this.searchQuery()?.trim()) filterParams.search = this.searchQuery().trim();
  if (this.selectedCategory()?.trim()) filterParams.category = this.selectedCategory().trim();
  if (this.selectedDivision()?.trim()) filterParams.division = this.selectedDivision().trim();
  if (this.selectedEmployee()?.toString().trim()) filterParams.employeeId = this.selectedEmployee();
  
  if (this.selectedSpecification()?.trim() && this.specificationValue()?.trim()) {
    filterParams.specName = this.selectedSpecification().trim();
    filterParams.specValue = this.specificationValue().trim();
  }

   
   // Log the final filter parameters being sent to the API
    this.assetPoolService.getFilteredAssets(filterParams).subscribe({
    next: (response: any) => {
      if (response.success && response.data) {
        const assets = response.data.assets || [];
        
        const transformed = assets.map((asset: any) => ({
          ...asset,
          assignedTo: asset.assignedUserName || 'Unassigned',
          empId: asset.assignedUserId?.toString() || '',
          displayName: asset.productName || asset.assetCode || 'Unknown',
          specifications: asset.notes || 'N/A'
        }));

        this.allAssets.set(transformed);
        
        
        this.totalItems.set(response.data.totalCount|| 0);
      }
      this.isLoading.set(false);
    },
    error: (err: any) => {
      console.error('❌ API Error:', err);
      this.errorMessage.set('Could not load assets. Please try again later.');
      this.allAssets.set([]);
      this.isLoading.set(false);
    }
  });
}


  // change handlers for filters and pagination

  onSearchChange(value: string) {
    this.searchSubject.next(value);
  }

  onSpecValueChange(value: string) {
    this.specValueSubject.next(value);
  }

  onCategoryChange(categoryName: string) {
    this.selectedCategory.set(categoryName);
    
    // Only load specifications if category is selected (not empty)
    if (categoryName && categoryName.trim()) {
      
      // Find category ID from loaded categories
      const selectedCat = this.categories().find(c => c.name === categoryName);
      
      if (selectedCat) {
        // Use category ID to fetch specifications
        this.assetPoolService.getSpecificationsByCategory(selectedCat.id).subscribe({
          next: (specs) => {
            this.specifications.set(specs);
          },
          error: (err) => {
            console.error(' Error loading specifications by category:', err);
            this.specifications.set([]);
          }
        });
      }
    } else {
      console.log(' Category is empty, clearing specifications');
      this.specifications.set([]);
    }
    
    this.specificationValue.set(''); 
    this.currentPage.set(1);
    this.loadFilteredAssets();
  }

  onDivisionChange(divisionName: string) {
    this.selectedDivision.set(divisionName);
    this.currentPage.set(1);
    this.loadFilteredAssets();
  }

  onEmployeeChange(employeeId: string) {
    this.selectedEmployee.set(employeeId);
    this.currentPage.set(1);
    this.loadFilteredAssets();
  }

  onSpecificationChange(specName: string) {
    this.selectedSpecification.set(specName);
    this.currentPage.set(1);
    if (this.specificationValue()) {
      this.loadFilteredAssets();
    }
  }

  onDropdownChange(event: any) {
    const selectedId = Number(event);
    const selected = this.approvedTransferRequests().find(req => req.id === selectedId);
    this.selectedTransferRequest.set(selected);
  }



  // --- Action Methods ---

  selectForTransfer(asset: Asset) {
    const request = this.selectedTransferRequest();
    if (!request) {
      alert('Please select an approved transfer request from the dropdown first.');
      return;
    }
    
    if (confirm(`Are you sure you want to select "${asset.productName || asset.assetCode}" for transfer?`)) {
      this.transferService.createTransferRecord({
        assetId: Number(asset.id),
        assetRequestId: request.id,
        userId: Number(this.authService.getUserId()) 
      }).subscribe({
        next: () => alert('Transfer record created successfully!'),
        error: () => alert('Failed to create transfer record. Please try again.')
      });
    }
  }



  // --- Pagination Controls ---
  
  onPageChange(page: number) { 
    this.currentPage.set(page); 
    this.loadFilteredAssets();
  }
  
  onPreviousPage() { 
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1); 
      this.loadFilteredAssets();
    }
  }
  
  onNextPage() { 
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1); 
      this.loadFilteredAssets();
    }
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }

  
}