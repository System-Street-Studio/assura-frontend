import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';
import { ProcurementService } from '../../services/procurement.service';
import { MaintenanceDto } from '../../models/maintenance.model';

export interface LiveMaintenanceRequest {
  id: number;
  employeeName: string;
  divisionName: string;
  date: string;
  specifications?: string;
  specialNote?: string;
  type?: string;
  description?: string;
  assetId?: number;
  // Template-compatible aliases
  assetName: string;
  division: string;
  timestamp: string;
  specificationsArray: string[];
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

  // Maintenance history (from /Maintenances)
  maintenanceHistory: MaintenanceDto[] = [];
  filteredHistory: MaintenanceDto[] = [];
  isLoading = false;
  historyPageSize = 5;
  historyCurrentPage = 1;

  // Live pending requests from backend (PendingProcurement status)
  pendingRequests: LiveMaintenanceRequest[] = [];
  filteredRequests: LiveMaintenanceRequest[] = [];
  selectedRequest: LiveMaintenanceRequest | null = null;
  isLoadingRequests = false;
  requestsPageSize = 5;
  requestsCurrentPage = 1;

  ngOnInit(): void {
    this.loadMaintenanceHistory();
    this.loadPendingRequests();
  }

  loadPendingRequests(): void {
    this.isLoadingRequests = true;
    this.procurementService.getPendingRequests().subscribe({
      next: (data: any[]) => {
        this.pendingRequests = data.map((r: any) => ({
          id: r.id,
          employeeName: r.employeeName,
          divisionName: r.divisionName,
          date: r.date,
          specifications: r.specifications,
          specialNote: r.specialNote,
          type: r.type,
          description: r.description,
          assetId: r.assetId,
          // Template-compatible aliases
          assetName: r.description || r.specialNote || `Request #${r.id}`,
          division: r.divisionName,
          timestamp: r.date ? new Date(r.date).toLocaleDateString() : 'N/A',
          specificationsArray: r.specifications ? [r.specifications] : []
        }));
        this.filteredRequests = [...this.pendingRequests];
        if (this.filteredRequests.length > 0) {
          this.selectedRequest = this.filteredRequests[0];
        }
        this.isLoadingRequests = false;
      },
      error: (err) => {
        console.error('Error loading pending requests', err);
        this.isLoadingRequests = false;
      }
    });
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

  selectRequest(request: LiveMaintenanceRequest): void {
    this.selectedRequest = request;
  }

  // History pagination
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

  // Requests pagination
  get requestsTotalPages(): number {
    return Math.max(1, Math.ceil(this.filteredRequests.length / this.requestsPageSize));
  }

  get requestsPageNumbers(): number[] {
    return Array.from({ length: this.requestsTotalPages }, (_, i) => i + 1);
  }

  get pagedRequests(): LiveMaintenanceRequest[] {
    const startIndex = (this.requestsCurrentPage - 1) * this.requestsPageSize;
    return this.filteredRequests.slice(startIndex, startIndex + this.requestsPageSize);
  }

  goToRequestsPage(page: number): void {
    if (page >= 1 && page <= this.requestsTotalPages) {
      this.requestsCurrentPage = page;
    }
  }

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
    if (this.selectedRequest) {
      this.router.navigate(['/procurement/maintenance/create'], {
        queryParams: {
          requestId: this.selectedRequest.id,
          description: this.selectedRequest.description || this.selectedRequest.assetName,
          division: this.selectedRequest.divisionName,
          date: new Date().toISOString().split('T')[0],
          assetId: this.selectedRequest.assetId || ''
        }
      });
    } else {
      this.router.navigate(['/procurement/maintenance/create']);
    }
  }

  navigateToFirms(): void {
    this.router.navigate(['/procurement/maintenance/repairing-firms']);
  }
}
