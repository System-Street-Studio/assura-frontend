import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, signal, computed, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AssetRequest, AssetService } from '../../services/asset-request.service';
import { AuthService } from '../../../../core/auth/auth.service';
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
    this.recentRequests().filter(r => this.assetService.normalizeStatus(r.status) === 'Pending').length
  );

  approvedCount = computed(() =>
    this.recentRequests().filter(r => this.assetService.normalizeStatus(r.status) === 'Approved').length
  );

  rejectedCount = computed(() =>
    this.recentRequests().filter(r => this.assetService.normalizeStatus(r.status) === 'Rejected').length
  );
  
  

  constructor(private assetService: AssetService, private cdr: ChangeDetectorRef, private router: Router, private authService: AuthService) {}
  isLoading = signal(false);

  // Fetch employee requests on component initialization
  ngOnInit() {
    const empId = this.authService.getUserId();
    if (!empId) {
      console.error('Employee ID not found');
      return;
    }

    this.isLoading.set(true);

    // Fetch requests for the logged-in employee
    this.assetService.getEmployeeRequests(empId).subscribe({
      next: (data: AssetRequest[]) => {

          // Keep only the latest 20 requests
        const limitedData = data.slice(0, this.maxRequests);
        this.recentRequests.set(limitedData);
        this.currentPage.set(1);
        this.isLoading.set(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching employee requests:', err);
        this.isLoading.set(false);
      }
    });
  }

  // Navigate to request details page
  onPageChange(page: number) {
    this.currentPage.set(page);
  }

  // TrackBy function for ngFor to optimize rendering
  trackByReqId(index: number, req: AssetRequest): number {
    return req.id;
  }

  // Navigate to request details page
  viewRequestDetails(request: AssetRequest) {
    this.router.navigate(['/employee/request-details', request.id], { state: { request } });
  }
}
  
  


