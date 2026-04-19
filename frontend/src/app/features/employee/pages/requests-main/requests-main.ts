import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, signal, computed, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AssetRequest, AssetService } from '../../services/asset-request.service';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';



@Component({
  selector: 'app-requests-main',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, PaginationComponent],
  templateUrl: './requests-main.html',
  styleUrl: './requests-main.css',
})
export class RequestsMainComponent implements OnInit {
  recentRequests = signal<AssetRequest[]>([]);
  currentPage = signal(1);
  itemsPerPage = 10;
  maxRequests = 20; // Show only latest 20 requests

  // Computed signal for total pages
  totalPages = computed(() => Math.ceil(this.recentRequests().length / this.itemsPerPage));

  // Computed signal for paginated requests
  paginatedRequests = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.recentRequests().slice(start, end);
  });

  // Computed signal for page numbers to display in pagination
  pageNumbers = computed(() => {
    const pages = [];
    const total = this.totalPages();
    const current = this.currentPage();

    // Show max 5 page buttons
    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + 4);

    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  });

  // Computed signals for status counts
  totalRequests = computed(() => this.recentRequests().length);
  
  pendingCount = computed(() => 
    this.recentRequests().filter(r => r.status === 'Pending').length
  );
  
  approvedCount = computed(() => 
    this.recentRequests().filter(r => r.status === 'Approved').length
  );
  
  rejectedCount = computed(() => 
    this.recentRequests().filter(r => r.status === 'Rejected').length
  );
  
  constructor(private assetService: AssetService, private cdr: ChangeDetectorRef, private router: Router) {}

  ngOnInit() {
    this.assetService.getPendingRequests().subscribe({
      next: (data: AssetRequest[]) => {
        // Keep only the latest 20 requests
        const limitedData = data.slice(0, this.maxRequests);
        this.recentRequests.set(limitedData);
        this.currentPage.set(1); // Reset to first page
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('Error fetching pending requests:', err)
    });
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
  }

  trackByReqId(index: number, req: AssetRequest): number {
    return req.id;
  }

  viewRequestDetails(request: AssetRequest) {
    this.router.navigate(['/employee/request-details', request.id], { state: { request } });
  }
}
  
  


