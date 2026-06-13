import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common'; // Fixed: Corrected the module path
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { RequestService } from '../../services/requests.service';
import { RequestItem } from '../../models/request.model';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';



@Component({
  selector: 'app-requests-page',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule, MatMenuModule, FormsModule,PaginationComponent],
  templateUrl: './requests-page.html',
  styleUrl: './requests-page.css',
})
export class RequestsPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private requestService = inject(RequestService);

  isLoading = signal<boolean>(true);

  // --- STATE SIGNALS ---
  activeTab = signal<'new' | 'transfer' | 'maintenance' | 'discard'>('new');
  searchQuery = signal<string>('');
  
  // Filter state
  selectedFilters = signal<Record<string, string[]>>({
    priority: [],
    category: [],
    status: []
  });

  // --- DATA SIGNALS ---
  requests = signal<RequestItem[]>([]);
  transferRequests = signal<RequestItem[]>([]);
  maintenanceRequests = signal<RequestItem[]>([]);
  discardRequests = signal<RequestItem[]>([]);

  // Pagination
  pageSize = 10; 
  currentPage = signal(1);

  // Summary Counts
  newAssetCount = signal(0);
  transferCount = signal(0);
  maintenanceCount = signal(0);
  discardCount = signal(0);

  // --- FILTER CONFIG ---
  filterConfig = [
    { label: 'Priority', key: 'priority', options: ['High', 'Normal', 'Low'] },
    { label: 'Status', key: 'status', options: ['Pending', 'Approved', 'Rejected', 'In Progress'] },
    { label: 'Asset Category', key: 'category', options: ['Laptop', 'Furniture', 'Electronics', 'Network'] },
  ];

 // requests-page.ts
ngOnInit() {
  // Mehema danna
  setTimeout(() => {
    this.loadData();
  });

  this.route.queryParamMap.subscribe(params => {
    const tab = params.get('tab');
    if (tab) {
      this.activeTab.set(tab as any);
    }
  });
}

  

  // 1. Service Call
  loadData() {
    Promise.resolve().then(() => this.isLoading.set(true));
   const isDivisionHead = true; 

   this.requestService.getAllRequests(isDivisionHead).subscribe({
      next: (allData: any[]) => { 
      
      // Use the data directly from service since it's already mapped correctly
      const mappedData: RequestItem[] = allData;

      
      
      const newAssetFiltered = mappedData.filter(r => r.type?.toLowerCase().replace(/\s/g, '') === 'newasset');
      const transferFiltered = mappedData.filter(r => r.type?.toLowerCase() === 'transfer');
      const maintenanceFiltered = mappedData.filter(r => r.type?.toLowerCase() === 'maintenance');
      const discardFiltered = mappedData.filter(r => r.type?.toLowerCase() === 'discard');
      
      
      
      this.requests.set(newAssetFiltered);
      this.transferRequests.set(transferFiltered);
      this.maintenanceRequests.set(maintenanceFiltered);
      this.discardRequests.set(discardFiltered);

      

        this.newAssetCount.set(this.requests().length);
        this.transferCount.set(this.transferRequests().length);
        this.maintenanceCount.set(this.maintenanceRequests().length);
        this.discardCount.set(this.discardRequests().length);
        this.isLoading.set(false);
      },
      
    });
  }


        // --- DYNAMIC FILTER ENGINE ---
        filteredResults = computed(() => {
          const tab = this.activeTab();
          const query = this.searchQuery().toLowerCase().trim();
          const filters = this.selectedFilters();

          let sourceList: RequestItem[] = [];
          switch (tab) {
            case 'transfer': sourceList = this.transferRequests(); break;
            case 'maintenance': sourceList = this.maintenanceRequests(); break;
            case 'discard': sourceList = this.discardRequests(); break;
            default: sourceList = this.requests(); break;
          }

          return sourceList.filter(item => {
            const personName = (item.name || item.employee || '').toLowerCase();
            const assetName = item.assetName.toLowerCase();
            
            const matchesSearch = !query || personName.includes(query) || assetName.includes(query);
            const matchesPriority = filters['priority'].length === 0 || filters['priority'].includes(item.priority);
            const matchesStatus = filters['status'].length === 0 || filters['status'].includes(item.status);
            const matchesCategory = filters['category'].length === 0 || 
                                  (item.category && filters['category'].includes(item.category)) ||
                                  filters['category'].some(cat => assetName.includes(cat.toLowerCase()));

            return matchesSearch && matchesPriority && matchesStatus && matchesCategory;
          });
        });

        filterCount = computed(() => {
          return Object.values(this.selectedFilters()).reduce((acc, curr) => acc + curr.length, 0);
        });

        // --- ACTIONS ---
        setTab(tab: 'new' | 'transfer' | 'maintenance' | 'discard') {
          this.activeTab.set(tab);
          this.resetFilters();
          this.currentPage.set(1);
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { tab: tab },
            queryParamsHandling: 'merge'
          });
        }

        toggleFilter(key: string, option: string) {
          const current = { ...this.selectedFilters() };
          const index = current[key].indexOf(option);
          
          if (index > -1) {
            current[key] = current[key].filter(val => val !== option);
          } else {
            current[key] = [...current[key], option];
          }
          this.selectedFilters.set(current);
          this.currentPage.set(1);
        }

        resetFilters() {
          this.selectedFilters.set({ priority: [], category: [], status: [] });
          this.searchQuery.set('');
          this.currentPage.set(1);
        }

        onSearchChange(value: string) {
          this.searchQuery.set(value);
          this.currentPage.set(1);
        }

        checkStatus(id: number) {
          console.log('Checking status for ID:', id);
        }

        viewDetails(item: RequestItem) {
        this.requestService.selectedRequest = item;
        const tab = this.activeTab();
        let routePath = '';

      
        switch (tab) {
          case 'new': routePath = '/approvals/new-asset-req'; break;
          case 'transfer': routePath = '/approvals/transfer-req'; break;
          case 'maintenance': routePath = '/approvals/maintenance-req'; break;
          case 'discard': routePath = '/approvals/discard-req'; break;
        }


        this.router.navigate([routePath, item.id], { 
        
          queryParams: { tab: tab } 
        });
      }


      checkDetails(item: RequestItem) {
        this.requestService.selectedRequest = item;
        
        const tab = this.activeTab();
        let routePath = '';

        switch (tab) {
          case 'new': routePath = '/approvals/new-asset-req'; break;
          case 'transfer': routePath = '/approvals/transfer-req'; break;
          case 'maintenance': routePath = '/approvals/maintenance-req'; break;
          case 'discard': routePath = '/approvals/discard-req'; break;
        }

        this.router.navigate([routePath, item.id], { 
          queryParams: { tab: tab, readOnly: true } 
        });
      }

      //  PAGINATION ENGINE 
    totalPages = computed(() => Math.max(1, Math.ceil(this.filteredResults().length / this.pageSize)));

    paginatedRequests = computed(() => {
      const start = (this.currentPage() - 1) * this.pageSize;
      return this.filteredResults().slice(start, start + this.pageSize);
    });

    pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

    onPageChange(page: number) {
      this.currentPage.set(page);
    }
}