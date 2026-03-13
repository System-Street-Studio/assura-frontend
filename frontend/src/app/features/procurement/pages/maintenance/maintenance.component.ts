import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar';
import { DataTableComponent, ColumnDef } from '../../../../shared/components/data-table/data-table';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';
import { ProcurementService } from '../../services/procurement.service';
import { MaintenanceDto } from '../../models/maintenance.model';

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
  imports: [CommonModule, SearchBarComponent, PaginationComponent],
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.css']
})
export class ProcurementMaintenanceComponent implements OnInit {
  private router = inject(Router);
  private procurementService = inject(ProcurementService);

  maintenanceHistory: MaintenanceDto[] = [];
  filteredHistory: MaintenanceDto[] = [];
  isLoading = false;

  // History Table pagination
  historyPageSize = 5;
  historyCurrentPage = 1;

  ngOnInit(): void {
    this.loadMaintenanceHistory();
  }

  loadMaintenanceHistory(): void {
    this.isLoading = true;
    this.procurementService.getMaintenances().subscribe({
      next: (data) => {
        this.maintenanceHistory = data;
        this.filteredHistory = [...this.maintenanceHistory];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading maintenance history', err);
        this.isLoading = false;
      }
    });
  }

  get historyTotalPages(): number {
    return Math.max(1, Math.ceil(this.filteredHistory.length / this.historyPageSize));
  }

  get historyPageNumbers(): number[] {
    return Array.from({ length: this.historyTotalPages }, (_, i) => i + 1);
  }

  get pagedHistory(): MaintenanceDto[] {
    const startIndex = (this.historyCurrentPage - 1) * this.historyPageSize;
    return this.filteredHistory.slice(startIndex, startIndex + this.historyPageSize);
  }

  goToHistoryPage(page: number): void {
    if (page >= 1 && page <= this.historyTotalPages) {
      this.historyCurrentPage = page;
    }
  }

  // Maintenance Requests Data (Still mock for now as backend for this is unclear)
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
      if (this.pagedRequests.length > 0) {
        this.selectedRequest = this.pagedRequests[0];
      }
    }
  }

  selectedRequest: MaintenanceRequest | null = this.maintenanceRequests[0];

  onSearch(query: string): void {
    this.historyCurrentPage = 1;
    if (!query) {
      this.filteredHistory = [...this.maintenanceHistory];
      return;
    }
    const lowerQuery = query.toLowerCase();
    this.filteredHistory = this.maintenanceHistory.filter(item =>
      item.maintenanceNumber.toLowerCase().includes(lowerQuery) ||
      item.assetName.toLowerCase().includes(lowerQuery)
    );
  }

  navigateToNote(id: number): void {
    this.router.navigate(['/procurement/maintenance/note', id]);
  }

  navigateToCreate(): void {
    this.router.navigate(['/procurement/maintenance/create']);
  }

  navigateToFirms(): void {
    this.router.navigate(['/procurement/maintenance/repairing-firms']);
  }

  selectRequest(request: MaintenanceRequest): void {
    this.selectedRequest = request;
  }
}
