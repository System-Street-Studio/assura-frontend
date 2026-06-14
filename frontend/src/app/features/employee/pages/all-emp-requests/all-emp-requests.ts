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

  onSearchChange(value: string) {
    this.searchQuery.set(value);
    this.currentPage.set(1);
  }

  requests = signal<AssetRequest[]>([]);

  // Pagination
  pageSize = 10;
  currentPage = signal(1);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    
    // Check if click is inside status filter container
    const inStatusFilter = target.closest('[data-filter="status-filter"]') !== null;
    
    // Close status menu if clicking outside
    if (this.isMenuOpen() && !inStatusFilter) {
      this.isMenuOpen.set(false);
    }
  }

  private authService = inject(AuthService);

  constructor(private assetService: AssetService) { }
  
  ngOnInit() {
    const userId = this.authService.getUserId();
    if (userId) {
      this.assetService.getEmployeeRequests(userId).subscribe((data: AssetRequest[]) => {
        this.requests.set(data);
      });
    }
  }


  filterStatus = signal<'All Types' | 'Pending' | 'Approved' | 'Rejected'>('All Types');
  isMenuOpen = signal(false); // To toggle the dropdown visibility

  /** Priority classes: */
  getPriorityClass(priority: string): string {
    return `priority-${priority.toLowerCase().replace(' ', '-')}`;
  }

  /** Status classes:*/
  getStatusClass(status: string): string {
    return `status-${status.toLowerCase().replace(' ', '-')}`;
  }

  // Update computed signal to include the status filter
  filteredRequests = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const status = this.filterStatus();

    return this.requests().filter(r => {
      const matchesSearch = r.id.toString().includes(query) || r.requestType.toLowerCase().includes(query);
      const matchesStatus = status === 'All Types' || r.status === status;
      return matchesSearch && matchesStatus;
    });
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredRequests().length / this.pageSize)));

  paginatedRequests = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredRequests().slice(start, start + this.pageSize);
  });

  pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  onPageChange(page: number) {
    this.currentPage.set(page);
  }

  toggleMenu() {
    this.isMenuOpen.update(v => !v);
  }


  setStatus(status: any) {
    this.filterStatus.set(status);
    this.currentPage.set(1); // Reset to first page on filter change
    this.isMenuOpen.set(false); // Close menu after selection
  }

  
  // Mock function to handle cancel action
  cancelRequest(requestId: number) {
    console.log('Cancelling request with ID:', requestId);
    this.requests.update(reqs => reqs.map(r => r.id === requestId ? { ...r, status: 'Cancelled' } : r));
  }
}