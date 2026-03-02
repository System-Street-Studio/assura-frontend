import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar';
import { DataTableComponent, ColumnDef } from '../../../../shared/components/data-table/data-table';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';

interface MaintenanceHistory {
  id: string;
  asset: string;
}

interface MaintenanceRequest {
  id: string;
  assetName: string;
  division: string;
  timestamp: string;
  date: string;
  specifications: string[];
  specialNote: string;
}

@Component({
  selector: 'app-procurement-maintenance',
  standalone: true,
  imports: [CommonModule, SearchBarComponent, DataTableComponent, PaginationComponent],
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.css']
})
export class ProcurementMaintenanceComponent {
  private router = inject(Router);

  // History Table Config
  historyColumns: ColumnDef[] = [
    { key: 'id', label: 'ID', type: 'text' },
    { key: 'asset', label: 'Asset', type: 'text' }
  ];

  maintenanceHistory: MaintenanceHistory[] = [
    { id: 'N123', asset: 'Dell XPS 15' },
    { id: 'N124', asset: 'MacBook Pro 14' },
    { id: 'N125', asset: 'ThinkPad X1' },
    { id: 'N126', asset: 'Logitech G502' },
    { id: 'N127', asset: 'Dell UltraSharp' },
    { id: 'N128', asset: 'Cisco Router' },
    { id: 'N129', asset: 'HP LaserJet' },
  ];

  filteredHistory: MaintenanceHistory[] = [...this.maintenanceHistory];

  // History Table pagination
  historyPageSize = 5;
  historyCurrentPage = 1;

  get historyTotalPages(): number {
    return Math.max(1, Math.ceil(this.filteredHistory.length / this.historyPageSize));
  }

  get historyPageNumbers(): number[] {
    return Array.from({ length: this.historyTotalPages }, (_, i) => i + 1);
  }

  get pagedHistory(): MaintenanceHistory[] {
    const startIndex = (this.historyCurrentPage - 1) * this.historyPageSize;
    return this.filteredHistory.slice(startIndex, startIndex + this.historyPageSize);
  }

  goToHistoryPage(page: number): void {
    if (page >= 1 && page <= this.historyTotalPages) {
      this.historyCurrentPage = page;
    }
  }

  // Maintenance Requests Data
  maintenanceRequests: MaintenanceRequest[] = [
    {
      id: '1',
      assetName: 'Dell XPS 15',
      division: 'Information Technology',
      timestamp: '1 day ago',
      date: '12 Jan 2026',
      specifications: [
        'RAM: 32GB',
        'Storage: 1TB',
        'Processor: Intel 14th gen i7'
      ],
      specialNote: 'Display is Broken'
    },
    {
      id: '2',
      assetName: 'MacBook Pro',
      division: 'HR',
      timestamp: '2 day ago',
      date: '10 Jan 2026',
      specifications: [
        'RAM: 16GB',
        'Storage: 512GB',
        'Processor: M3 Pro'
      ],
      specialNote: 'Battery replacement needed'
    },
    {
      id: '3',
      assetName: 'Cisco Switch',
      division: 'Admin',
      timestamp: '12 . 12 . 2025',
      date: '12 Dec 2025',
      specifications: [
        'Ports: 24',
        'Type: Managed'
      ],
      specialNote: 'Port 5 is faulty'
    },
    {
      id: '4',
      assetName: 'HP LaserJet',
      division: 'Finance',
      timestamp: '3 days ago',
      date: '08 Jan 2026',
      specifications: [
        'Model: Enterprise M507dn',
        'Toner: Black'
      ],
      specialNote: 'Paper jam issue in tray 2'
    },
    {
      id: '5',
      assetName: 'Dell Monitor',
      division: 'IT',
      timestamp: '4 days ago',
      date: '07 Jan 2026',
      specifications: [
        'Size: 27 inch',
        'Resolution: 4K'
      ],
      specialNote: 'Flickering problem'
    },
    {
      id: '6',
      assetName: 'Logitech Mouse',
      division: 'HR',
      timestamp: '1 week ago',
      date: '01 Jan 2026',
      specifications: [
        'Model: MX Master 3',
        'Type: Wireless'
      ],
      specialNote: 'Left click not working'
    }
  ];

  // Requests list pagination
  requestsPageSize = 3;
  requestsCurrentPage = 1;

  get requestsTotalPages(): number {
    return Math.max(1, Math.ceil(this.maintenanceRequests.length / this.requestsPageSize));
  }

  get requestsPageNumbers(): number[] {
    return Array.from({ length: this.requestsTotalPages }, (_, i) => i + 1);
  }

  get pagedRequests(): MaintenanceRequest[] {
    const startIndex = (this.requestsCurrentPage - 1) * this.requestsPageSize;
    return this.maintenanceRequests.slice(startIndex, startIndex + this.requestsPageSize);
  }

  goToRequestsPage(page: number): void {
    if (page >= 1 && page <= this.requestsTotalPages) {
      this.requestsCurrentPage = page;
      // Optionally auto-select the first request on the new page
      if (this.pagedRequests.length > 0) {
        this.selectedRequest = this.pagedRequests[0];
      }
    }
  }

  selectedRequest: MaintenanceRequest | null = this.maintenanceRequests[0];

  onSearch(query: string): void {
    this.historyCurrentPage = 1; // Reset to first page on search
    if (!query) {
      this.filteredHistory = [...this.maintenanceHistory];
      return;
    }
    const lowerQuery = query.toLowerCase();
    this.filteredHistory = this.maintenanceHistory.filter(item =>
      item.id.toLowerCase().includes(lowerQuery) ||
      item.asset.toLowerCase().includes(lowerQuery)
    );
  }

  onHistoryRowClick(row: MaintenanceHistory): void {
    console.log('History row clicked:', row);
  }

  navigateToNote(id: string): void {
    this.router.navigate(['/procurement/maintenance/note', id]);
  }

  navigateToCreate(): void {
    this.router.navigate(['/procurement/maintenance/create']);
  }

  selectRequest(request: MaintenanceRequest): void {
    this.selectedRequest = request;
  }
}

