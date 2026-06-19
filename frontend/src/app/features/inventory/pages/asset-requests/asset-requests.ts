import { Component, OnInit, inject, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RequestService, SuggestedAsset } from '../../services/request.service';
import { AssetRequest, RequestPriority, RequestStatus } from '../../models/request.model';
import { ToastService } from '../../../../shared/services/toast.service';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-asset-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, PaginationComponent],
  templateUrl: './asset-requests.html',
  styleUrls: ['./asset-requests.css'],
})
export class AssetRequestsComponent implements OnInit {
  private requestService = inject(RequestService);
  private toast = inject(ToastService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  allRequests = signal<AssetRequest[]>([]);
  filteredRequests = signal<AssetRequest[]>([]);
  viewRequests = signal<AssetRequest[]>([]);

  loading = signal(true);


  searchTerm = '';
  filterStatus = '';
  filterPriority = '';
  filterDivision = '';

  currentPage = 1;
  pageSize = 10;
  pageSizes = [5, 10, 25, 50];
  pages: number[] = [1];
  divisions: string[] = [];

  /* ── Action modal ── */
  showActionModal = false;
  actionType: 'approve' | 'reject' = 'approve';
  actionRequest: AssetRequest | null = null;
  actionNotes = '';
  actionProcessing = false;

  /* ── Process modal ── */
  showProcessModal = false;
  processRequest: AssetRequest | null = null;
  processIsInStock = true;
  processAssetId: number | null = null;
  suggestedAssets: SuggestedAsset[] = [];
  selectedSuggestedAssetId: number | null = null;
  processRemarks = '';
  processLoading = false;

  /* ── Detail drawer ── */
  showDetail = false;
  detailRequest: AssetRequest | null = null;

  /* ── Stats ── */
  get totalCount(): number {
    return this.allRequests().length;
  }

  get pendingCount(): number {
    return this.allRequests().filter((r) => r.status === 'Pending').length;
  }

  get approvedCount(): number {
    return this.allRequests().filter((r) => r.status === 'Approved').length;
  }

  get rejectedCount(): number {
    return this.allRequests().filter((r) => r.status === 'Rejected').length;
  }

  get fulfilledCount(): number {
    return this.allRequests().filter((r) => r.status === 'Fulfilled').length;
  }

  get urgentCount(): number {
    return this.allRequests().filter((r) => r.priority === 'Urgent' && r.status === 'Pending').length;
  }

  get departments(): string[] {
    const depts = new Set(this.allRequests().map((r) => r.division));
    return Array.from(depts).sort();
  }

  get statuses(): RequestStatus[] {
    return ['Pending', 'Approved', 'Rejected', 'Fulfilled', 'Cancelled'];
  }

  get priorities(): RequestPriority[] {
    return ['Urgent', 'High', 'Normal', 'Low'];
  }
  get totalPages(): number {
    return Math.ceil(this.filteredRequests().length / this.pageSize) || 1;
  }

  get showingFrom(): number {
    return this.filteredRequests().length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get showingTo(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredRequests().length);
  }

  get selectedCount(): number {
    return this.viewRequests().filter((r) => r.selected).length;
  }

  get allSelected(): boolean {
    return this.viewRequests().length > 0 && this.viewRequests().every((r) => r.selected);
  }

  get isStorekeeper(): boolean {
    return this.authService.hasRole(['Storekeeper', 'Admin']);
  }

  ngOnInit(): void {
    this.loading.set(true);
    console.log('📥 Loading inventory requests...');

    this.requestService.getAll().subscribe({
      next: (existingRequests: AssetRequest[]) => {
        const initial = existingRequests || [];
        console.log('✅ getAll() returned:', initial.length, 'requests');
        this.allRequests.set(initial);

        this.requestService.getApprovedNewAssetRequests().subscribe({
          next: (approvedRequests: AssetRequest[]) => {
            console.log('✅ getApprovedNewAssetRequests() returned:', approvedRequests.length, 'requests');
            if (approvedRequests?.length > 0) {
              this.allRequests.update(current => {
                const merged = [...current, ...approvedRequests];
                return merged.sort((a, b) => Number(b.id) - Number(a.id));
              });
            }
            this.applyFilters();
            this.loading.set(false);
          },
          error: (err) => {
            console.warn('⚠️ Warning:', err);
            this.applyFilters();
            this.loading.set(false);
          }
        });
      },
      error: () => {
        this.toast.show('Failed to load requests', 'error');
        this.loading.set(false);
      }
    });
  }

  /* ── Filtering ── */
  applyFilters(): void {
    console.log('🔄 applyFilters() called - loading:', this.loading());
    console.log('  allRequests:', this.allRequests().length, this.allRequests());

    const term = this.searchTerm.toLowerCase().trim();
    const results = this.allRequests().filter((r) => {
      const name = (r.requesterName || r.requestedBy || '').toLowerCase();
      const asset = (r.assetName || '').toLowerCase();
      const requestedBy = (r.requestedBy || '').toLowerCase();

      const matchesSearch =
        !term ||
        name.includes(term) ||
        requestedBy.includes(term) ||
        String(r.id).toLowerCase().includes(term) ||
        (r.requestNumber || '').toLowerCase().includes(term) ||
        r.assetName.toLowerCase().includes(term) ||
        asset.includes(term) ||
        (r.division || '').toLowerCase().includes(term) ||
        (r.reason || '').toLowerCase().includes(term);

      const matchesStatus = !this.filterStatus || r.status === this.filterStatus;
      const matchesPriority = !this.filterPriority || r.priority === this.filterPriority;
      const matchesDept = !this.filterDivision || r.division === this.filterDivision;

      return matchesSearch && matchesStatus && matchesPriority && matchesDept;
    });

    // Sort by requestDate (most recent first)
    results.sort((a, b) => {
      const dateA = new Date(a.requestDate).getTime();
      const dateB = new Date(b.requestDate).getTime();
      return dateB - dateA; // Descending order (newest first)
    });

    console.log('  filteredRequests after filter and sort:', results.length, results);
    this.filteredRequests.set(results);
    this.currentPage = 1;
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.updateView();

    if (this.loading()) {
      console.log('🔴 Setting loading to false...');
      this.loading.set(false);
    }

    console.log('🟢 applyFilters() END - loading now:', this.loading(), 'viewRequests:', this.viewRequests().length);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filterStatus = '';
    this.filterPriority = '';
    this.filterDivision = '';
    this.applyFilters();
  }

  get hasActiveFilters(): boolean {
    return !!this.searchTerm || !!this.filterStatus || !!this.filterPriority || !!this.filterDivision;
  }

  /* ── Pagination ── */
  updateView(): void {
    console.log('📄 updateView() START - loading:', this.loading());
    const start = (this.currentPage - 1) * this.pageSize;
    const sliced = this.filteredRequests().slice(start, start + this.pageSize);
    console.log('📄 updateView():', {
      currentPage: this.currentPage,
      pageSize: this.pageSize,
      totalFiltered: this.filteredRequests().length,
      sliced: sliced.length,
      data: sliced,
      loading: this.loading()
    });
    this.viewRequests.set(sliced);
    console.log('📄 updateView() END - viewRequests now has:', this.viewRequests().length, this.viewRequests());
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updateView();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.updateView();
  }

  /* ── Selection ── */
  toggleSelectAll(): void {
    const target = !this.allSelected;
    this.viewRequests().forEach((r) => (r.selected = target));
  }

  clearSelection(): void {
    this.allRequests().forEach((r) => (r.selected = false));
  }

  /* ── Actions ── */
  openAction(type: 'approve' | 'reject', request: AssetRequest): void {
    this.actionType = type;
    this.actionRequest = request;
    this.actionNotes = '';
    this.showActionModal = true;
  }

  cancelAction(): void {
    this.showActionModal = false;
    this.actionRequest = null;
  }

  confirmAction(): void {
    if (!this.actionRequest) return;
    this.actionProcessing = true;

    const obs =
      this.actionType === 'approve'
        ? this.requestService.approve(this.actionRequest.id, this.actionNotes)
        : this.requestService.reject(this.actionRequest.id, this.actionNotes);

    obs.subscribe({
      next: (updated: AssetRequest) => {
        const idx = this.allRequests().findIndex((r) => r.id === updated.id);
        if (idx !== -1) {
          this.allRequests.update(current => {
            const updated_arr = [...current];
            updated_arr[idx] = updated;
            return updated_arr;
          });
        }
        this.applyFilters();

        this.showActionModal = false;
        this.actionProcessing = false;

        const verb = this.actionType === 'approve' ? 'approved' : 'rejected';
        this.toast.show(`Request ${updated.id} has been ${verb}`, 'success');

        // Refresh approved requests after approval/rejection - defer to next tick
        setTimeout(() => this.refreshApprovedRequests(), 0);
      },
      error: () => {
        this.actionProcessing = false;
        this.toast.show('Action failed. Please try again.', 'error');
      },
    });
  }

  private refreshApprovedRequests(): void {
    this.requestService.getApprovedNewAssetRequests().subscribe({
      next: (approvedRequests: AssetRequest[]) => {
        if (approvedRequests && approvedRequests.length > 0) {
          // Remove duplicates and merge with existing requests
          this.allRequests.update(current => {
            const existingIds = current.filter(r => r.status !== 'Approved').map(r => r.id);
            const newApproved = approvedRequests.filter(r => !existingIds.includes(r.id));
            const nonApproved = current.filter(r => r.status !== 'Approved');
            return [...nonApproved, ...newApproved];
          });
          this.applyFilters();
        }
      },
      error: (err: any) => console.warn('Could not refresh approved requests:', err)
    });
  }

  openDetail(request: AssetRequest): void {
    this.detailRequest = request;
    this.showDetail = true;
  }

  closeDetail(): void {
    this.showDetail = false;
    this.detailRequest = null;
  }

  /* ── Helpers ── */
  getStatusClass(status: RequestStatus): string {
    if (status === 'Pending' || status === 'PendingStorekeeperReview') return 'pending';
    if (status === 'TemporaryAssigned') return 'approved';
    if (status === 'PendingProcurement') return 'rejected';
    if (status === 'Approved') return 'approved';
    if (status === 'Rejected') return 'rejected';
    if (status === 'Fulfilled') return 'fulfilled';
    return 'cancelled';
  }

  getPriorityClass(priority: RequestPriority): string {
    const map: Record<RequestPriority, string> = {
      Urgent: 'urgent',
      High: 'high',
      Medium: 'medium',
      Normal: 'normal',
      Low: 'low',
    };
    return map[priority] || '';
  }

  getPriorityIcon(priority: RequestPriority): string {
    const map: Record<RequestPriority, string> = {
      Urgent: 'local_fire_department',
      High: 'arrow_upward',
      Medium: 'remove',
      Normal: 'remove',
      Low: 'arrow_downward',
    };
    return map[priority] || 'remove';
  }

  getTimeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  getAvatarClass(id: string | number): string {
    const num = parseInt(String(id).replace('REQ-', ''), 10) || 0;
    const variants = ['teal', 'blue', 'purple', 'green', 'orange', 'indigo'];
    return variants[num % variants.length];
  }

  /* ── Process ── */
  openProcess(request: AssetRequest): void {
    this.processRequest = request;
    this.processIsInStock = true;
    this.processAssetId = null;
    this.selectedSuggestedAssetId = null;
    this.suggestedAssets = [];
    this.processRemarks = '';
    this.showProcessModal = true;
    this.loadSuggestedAssets(request.id);
  }

  canStorekeeperProcess(request: AssetRequest): boolean {
    return request.status === 'Pending' || request.status === 'PendingStorekeeperReview' || request.status === 'Approved';
  }

  canStorekeeperConfirm(request: AssetRequest): boolean {
    return request.status === 'TemporaryAssigned';
  }

  cancelProcess(): void {
    this.showProcessModal = false;
    this.processRequest = null;
    this.selectedSuggestedAssetId = null;
    this.suggestedAssets = [];
  }

  loadSuggestedAssets(requestId: number | string): void {
    this.requestService.getSuggestedAssets(requestId).subscribe({
      next: (assets) => {
        this.suggestedAssets = assets || [];
        if (this.suggestedAssets.length > 0) {
          this.selectedSuggestedAssetId = this.suggestedAssets[0].id;
          this.processAssetId = this.suggestedAssets[0].id;
        }
      },
      error: () => {
        this.suggestedAssets = [];
      }
    });
  }

  onSuggestedAssetChanged(): void {
    this.processAssetId = this.selectedSuggestedAssetId;
  }

  get selectedSuggestedAsset(): SuggestedAsset | null {
    if (!this.selectedSuggestedAssetId) return null;
    return this.suggestedAssets.find(a => a.id === this.selectedSuggestedAssetId) ?? null;
  }

  get canSubmitProcess(): boolean {
    if (!this.processIsInStock) return true;
    return !!this.processAssetId;
  }

  confirmProcess(): void {
    if (!this.processRequest) return;
    this.processLoading = true;

    const command = {
      id: Number(this.processRequest.id),
      assetId: this.processIsInStock ? this.processAssetId : null,
      isInStock: this.processIsInStock,
      remarks: this.processRemarks
    };

    this.requestService.process(this.processRequest.id, command).subscribe({
      next: () => {
        this.toast.show('Request processed successfully', 'success');
        this.showProcessModal = false;
        this.processLoading = false;
        this.ngOnInit(); // Refresh list
      },
      error: () => {
        this.toast.show('Failed to process request', 'error');
        this.processLoading = false;
      }
    });
  }

  confirmTemporaryAssignment(request: AssetRequest): void {
    this.requestService.confirmTemporaryAssignment(request.id).subscribe({
      next: () => {
        this.toast.show('Temporary assignment confirmed', 'success');
        this.ngOnInit();
      },
      error: () => {
        this.toast.show('Failed to confirm assignment', 'error');
      },
    });
  }
}
