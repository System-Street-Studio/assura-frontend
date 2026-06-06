import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common'; // Fixed: Corrected the module path
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { RequestService } from '../../services/requests.service';
import { RequestItem } from '../../models/request.model';



@Component({
  selector: 'app-requests-page',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule, MatMenuModule, FormsModule],
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
    status: [],
    division: []
  });

  // --- DATA SIGNALS ---
  requests = signal<RequestItem[]>([]);
  transferRequests = signal<RequestItem[]>([]);
  maintenanceRequests = signal<RequestItem[]>([]);
  discardRequests = signal<RequestItem[]>([]);

  // Summary Counts
  newAssetCount = signal(0);
  transferCount = signal(0);
  maintenanceCount = signal(0);
  discardCount = signal(0);

  // --- FILTER CONFIG ---
  filterConfig = [
    { label: 'Priority', key: 'priority', options: ['High', 'Normal', 'Low'] },
    {
      label: 'Status',
      key: 'status',
      options: [
        'PendingDivisionHeadApproval',
        'PendingStorekeeperReview',
        'TemporaryAssigned',
        'PendingProcurement',
        'Approved',
        'Rejected'
      ]
    },
    { label: 'Division', key: 'division', options: [] },
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
    this.isLoading.set(true);

<<<<<<< HEAD

    this.requestService.getAllRequests().subscribe({
      next: (allData: any[]) => {
        console.log("All Data:", allData);
        
        // Ensure data is mapped to RequestItem structure
        const mappedData: RequestItem[] = allData.map(item => ({
          id: item.id,
          requesterId: item.requesterId,
          requestNumber: item.requestNumber,
          name: item.requesterName || item.name,
          employee: item.requesterName || item.employee,
          assetName: item.assetName ?? 'N/A',
          category: item.type || 'Asset',
          division: item.department || item.division,
          status: item.status,
          date: item.createdAt || item.date,
          priority: item.priority,
          type: item.type,
          quantity: item.quantity,
          description: item.description,
          reason: item.description
        }));

        const divs = new Set(mappedData.map(r => r.division).filter(Boolean));
        this.filterConfig[2].options = Array.from(divs).sort() as string[];

        this.requests.set(mappedData.filter(r => r.type?.toLowerCase().replace(/\s/g, '') === 'asset' || r.type?.toLowerCase().replace(/\s/g, '') === 'newasset'));
        this.transferRequests.set(mappedData.filter(r => r.type?.toLowerCase() === 'transfer'));
        this.maintenanceRequests.set(mappedData.filter(r => r.type?.toLowerCase() === 'maintenance'));
        this.discardRequests.set(mappedData.filter(r => r.type?.toLowerCase() === 'discard'));

=======
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

      
>>>>>>> feature/division-head-part

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

      const matchesDivision = filters['division'].length === 0 || (item.division && filters['division'].includes(item.division));
      return matchesSearch && matchesPriority && matchesStatus && matchesCategory && matchesDivision;
    });
  });

  filterCount = computed(() => {
    return Object.values(this.selectedFilters()).reduce((acc, curr) => acc + curr.length, 0);
  });

  // --- ACTIONS ---
  setTab(tab: 'new' | 'transfer' | 'maintenance' | 'discard') {
    this.activeTab.set(tab);
    this.resetFilters();
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
  }

  resetFilters() {
    this.selectedFilters.set({ priority: [], category: [], status: [], division: [] });
    this.searchQuery.set('');
  }

  checkStatus(id: number) {
    console.log('Checking status for ID:', id);
  }

  viewDetails(item: RequestItem) {
<<<<<<< HEAD
    this.requestService.selectedRequest = item;
    console.log("sending data:", item);
    const tab = this.activeTab();
    let routePath = '';
=======
  this.requestService.selectedRequest = item;
  const tab = this.activeTab();
  let routePath = '';
>>>>>>> feature/division-head-part


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
    console.log("Checking data:", item);
    const tab = this.activeTab();
    let routePath = '';

    switch (tab) {
      case 'new': routePath = '/approvals/new-asset-req'; break;
      case 'transfer': routePath = '/approvals/transfer-req'; break;
      case 'maintenance': routePath = '/approvals/maintenance-req'; break;
      case 'discard': routePath = '/approvals/discard-req'; break;
    }

<<<<<<< HEAD
    this.router.navigate([routePath, item.id], { 
      queryParams: { tab: tab, readOnly: true } 
    });
=======

checkDetails(item: RequestItem) {
  this.requestService.selectedRequest = item;
  
  const tab = this.activeTab();
  let routePath = '';

  switch (tab) {
    case 'new': routePath = '/approvals/new-asset-req'; break;
    case 'transfer': routePath = '/approvals/transfer-req'; break;
    case 'maintenance': routePath = '/approvals/maintenance-req'; break;
    case 'discard': routePath = '/approvals/discard-req'; break;
>>>>>>> feature/division-head-part
  }

}