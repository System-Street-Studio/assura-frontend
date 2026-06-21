import { Component, signal, computed, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';
import { AssetRequest, AssetService } from '../../services/asset-request.service';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-all-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule, MatFormFieldModule, MatInputModule, PaginationComponent],
  templateUrl: './all-emp-requests.html',
  styleUrl: './all-emp-requests.css'
})
export class AllRequestsComponent implements OnInit {
  searchQuery = signal('');
  requests = signal<AssetRequest[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // Pagination
  pageSize = 10;
  currentPage = signal(1);
  
  filterStatus = signal<'All Types' | 'Pending' | 'Approved' | 'Rejected'>('All Types');
  isMenuOpen = signal(false);

  private authService = inject(AuthService);
  private assetService = inject(AssetService);

  onSearchChange(value: string) {
    this.searchQuery.set(value);
    this.currentPage.set(1);
  }
  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const inStatusFilter = target.closest('[data-filter="status-filter"]') !== null;
    if (this.isMenuOpen() && !inStatusFilter) {
      this.isMenuOpen.set(false);
    }
  }
  
  //get employee requests
    ngOnInit() {
    const userId = this.authService.getUserId();
    if (userId) {
     
      this.isLoading.set(true);
      
      this.assetService.getEmployeeRequests(userId).subscribe({
        next: (data: AssetRequest[]) => {
          this.requests.set(data);
          this.isLoading.set(false); 
        },
        error: (err) => {
          console.error('Error fetching requests:', err);
          this.isLoading.set(false);
        }
      });
    }
  }

  //get priorities
  getPriorityClass(priority: string): string {
    return `priority-${priority.toLowerCase().replace(' ', '-')}`;
  }

  //get status
  getStatusClass(status: string): string {
    return `status-${status.toLowerCase().replace(' ', '-')}`;
  }

  //filter requests
  filteredRequests = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.filterStatus();

    return this.requests().filter(r => {
      const matchesSearch = r.id.toString().includes(query) || 
                            r.requestType.toLowerCase().includes(query) ||
                            (r.assetName && r.assetName.toLowerCase().includes(query));
      const matchesStatus = status === 'All Types' || r.status === status;
      return matchesSearch && matchesStatus;
    });
  });

  //pagination
  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredRequests().length / this.pageSize)));

  paginatedRequests = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredRequests().slice(start, start + this.pageSize);
  });

  pageNumbers = computed(() => {
    const pages = [];
    for (let i = 1; i <= this.totalPages(); i++) {
      pages.push(i);
    }
    return pages;
  });

  onPageChange(page: number) {
    this.currentPage.set(page);
  }

  //view mode
  toggleMenu() {
    this.isMenuOpen.update(v => !v);
  }

  //filter by status 
  setStatus(status: 'All Types' | 'Pending' | 'Approved' | 'Rejected') {
    this.filterStatus.set(status);
    this.currentPage.set(1);
    this.isMenuOpen.set(false);
  }
  
  //cancel request
  cancelRequest(requestId: number) {
    console.log('Cancelling request with ID:', requestId);
    this.requests.update(reqs => reqs.map(r => r.id === requestId ? { ...r, status: 'Cancelled' } : r));
  }
}