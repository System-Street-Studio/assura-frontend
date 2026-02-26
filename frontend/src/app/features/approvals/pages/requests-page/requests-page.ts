import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common'; // Fixed: Corrected the module path
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';

// Universal interface for all request types
interface RequestItem {
  id: number;
  name?: string;
  employee?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'In Progress';
  asset: string;
  category?: string;
  date: string;
  priority: 'High' | 'Normal' | 'Low';
}

@Component({
  selector: 'app-requests-page',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule, RouterLink, MatMenuModule, FormsModule],
  templateUrl: './requests-page.html',
  styleUrl: './requests-page.css',
})
export class RequestsPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

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
  requests = signal<RequestItem[]>([
    { id: 1, name: 'Harry Ekanayeka', status: 'Pending', asset: 'Laptop (1)', date: '2025-08-15', priority: 'High' },
    { id: 2, name: 'Jenny Athapaththu', status: 'Pending', asset: 'Office Chair (2)', date: '2025-08-15', priority: 'Normal' },
    { id: 3, name: 'Sarah Kodithuwakku', status: 'Approved', asset: 'Monitor (3)', date: '2025-08-15', priority: 'High' },
    { id: 4, name: 'Gavesh Gamage', status: 'Pending', asset: 'Projector (1)', date: '2025-08-15', priority: 'Low' },
    { id: 5, name: 'Rishmi Hans', status: 'Rejected', asset: 'Standing Desk (1)', date: '2025-08-15', priority: 'Low' }
  ]);

  transferRequests = signal<RequestItem[]>([
    { id: 101, date: '2024-10-26', asset: 'Table', category: '3x4', employee: 'Jenny Athapaththu', status: 'Pending', priority: 'Normal' },
    { id: 102, date: '2024-10-26', asset: 'Laptop', category: 'Lenovo X1 Carbon', employee: 'Harry Ekanayeka', status: 'Pending', priority: 'High' },
    { id: 103, date: '2024-10-26', asset: 'Keyboard', category: 'Logitech MX Keys', employee: 'Sarah Kodithuwakku', status: 'Rejected', priority: 'Normal' }
  ]);

  maintenanceRequests = signal<RequestItem[]>([
    { id: 201, date: '2024-11-05', asset: 'Printer', category: 'Hardware', employee: 'Kamal Silva', status: 'Pending', priority: 'High' },
    { id: 202, date: '2024-11-06', asset: 'A/C Unit', category: 'Infrastructure', employee: 'Nimal Perera', status: 'Approved', priority: 'Normal' }
  ]);

  discardRequests = signal<RequestItem[]>([
    { id: 301, date: '2024-11-10', asset: 'Old Server', category: 'IT', employee: 'Sunil Shantha', status: 'Pending', priority: 'Low' }
  ]);

  // Summary Counts
  newAssetCount = signal(3);
  transferCount = signal(7);
  maintenanceCount = signal(2);
  discardCount = signal(1);

  // --- FILTER CONFIG ---
  filterConfig = [
    { label: 'Priority', key: 'priority', options: ['High', 'Normal', 'Low'] },
    { label: 'Status', key: 'status', options: ['Pending', 'Approved', 'Rejected', 'In Progress'] },
    { label: 'Asset Category', key: 'category', options: ['Laptop', 'Furniture', 'Electronics', 'Network'] },
  ];

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const tab = params.get('tab');
      if (tab) {
        this.activeTab.set(tab as any);
      }
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
      const assetName = item.asset.toLowerCase();
      
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
    this.selectedFilters.set({ priority: [], category: [], status: [] });
    this.searchQuery.set('');
  }

  checkStatus(id: number) {
    console.log('Checking status for ID:', id);
  }
}