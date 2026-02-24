import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RequestService } from '../../services/request.service';
import { AssetRequest, RequestPriority, RequestStatus } from '../../models/request.model';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-asset-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './asset-requests.html',
  styleUrls: ['./asset-requests.css'],
})
export class AssetRequestsComponent implements OnInit {
  private requestService = inject(RequestService);
  private toast = inject(ToastService);

  allRequests: AssetRequest[] = [];
  filteredRequests: AssetRequest[] = [];
  viewRequests: AssetRequest[] = [];

  loading = true;
  searchTerm = '';
  filterStatus = '';
  filterPriority = '';
  filterDepartment = '';

  currentPage = 1;
  pageSize = 10;
  pageSizes = [5, 10, 25, 50];

  /* ── Action modal ── */
  showActionModal = false;
  actionType: 'approve' | 'reject' = 'approve';
  actionRequest: AssetRequest | null = null;
  actionNotes = '';
  actionProcessing = false;

  /* ── Detail drawer ── */
  showDetail = false;
  detailRequest: AssetRequest | null = null;

  /* ── Stats ── */
  get totalCount(): number {
    return this.allRequests.length;
  }

  get pendingCount(): number {
    return this.allRequests.filter((r) => r.status === 'Pending').length;
  }

  get approvedCount(): number {
    return this.allRequests.filter((r) => r.status === 'Approved').length;
  }

  get rejectedCount(): number {
    return this.allRequests.filter((r) => r.status === 'Rejected').length;
  }

  get fulfilledCount(): number {
    return this.allRequests.filter((r) => r.status === 'Fulfilled').length;
  }

  get urgentCount(): number {
    return this.allRequests.filter((r) => r.priority === 'Urgent' && r.status === 'Pending').length;
  }

  get departments(): string[] {
    const depts = new Set(this.allRequests.map((r) => r.department));
    return Array.from(depts).sort();
  }

  get statuses(): RequestStatus[] {
    return ['Pending', 'Approved', 'Rejected', 'Fulfilled', 'Cancelled'];
  }

  get priorities(): RequestPriority[] {
    return ['Urgent', 'High', 'Medium', 'Low'];
  }

  get totalPages(): number {
    return Math.ceil(this.filteredRequests.length / this.pageSize) || 1;
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get showingFrom(): number {
    return this.filteredRequests.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get showingTo(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredRequests.length);
  }

  get selectedCount(): number {
    return this.viewRequests.filter((r) => r.selected).length;
  }

  get allSelected(): boolean {
    return this.viewRequests.length > 0 && this.viewRequests.every((r) => r.selected);
  }

  ngOnInit(): void {
    this.requestService.getAll().subscribe({
      next: (data: AssetRequest[]) => {
        this.allRequests = data;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.toast.show('Failed to load requests', 'error');
        this.loading = false;
      },
    });
  }

  /* ── Filtering ── */
  applyFilters(): void {
    const term = this.searchTerm.toLowerCase().trim();

    this.filteredRequests = this.allRequests.filter((r) => {
      const matchesSearch =
        !term ||
        r.requestedBy.toLowerCase().includes(term) ||
        r.id.toLowerCase().includes(term) ||
        r.assetName.toLowerCase().includes(term) ||
        r.department.toLowerCase().includes(term) ||
        r.reason.toLowerCase().includes(term);

      const matchesStatus = !this.filterStatus || r.status === this.filterStatus;
      const matchesPriority = !this.filterPriority || r.priority === this.filterPriority;
      const matchesDept = !this.filterDepartment || r.department === this.filterDepartment;

      return matchesSearch && matchesStatus && matchesPriority && matchesDept;
    });

    this.currentPage = 1;
    this.updateView();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filterStatus = '';
    this.filterPriority = '';
    this.filterDepartment = '';
    this.applyFilters();
  }

  get hasActiveFilters(): boolean {
    return !!this.searchTerm || !!this.filterStatus || !!this.filterPriority || !!this.filterDepartment;
  }

  /* ── Pagination ── */
  updateView(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.viewRequests = this.filteredRequests.slice(start, start + this.pageSize);
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
    this.viewRequests.forEach((r) => (r.selected = target));
  }

  clearSelection(): void {
    this.allRequests.forEach((r) => (r.selected = false));
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
        const idx = this.allRequests.findIndex((r) => r.id === updated.id);
        if (idx !== -1) this.allRequests[idx] = updated;
        this.applyFilters();

        this.showActionModal = false;
        this.actionProcessing = false;

        const verb = this.actionType === 'approve' ? 'approved' : 'rejected';
        this.toast.show(`Request ${updated.id} has been ${verb}`, 'success');
      },
      error: () => {
        this.actionProcessing = false;
        this.toast.show('Action failed. Please try again.', 'error');
      },
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
    const map: Record<RequestStatus, string> = {
      Pending: 'pending',
      Approved: 'approved',
      Rejected: 'rejected',
      Fulfilled: 'fulfilled',
      Cancelled: 'cancelled',
    };
    return map[status] || '';
  }

  getPriorityClass(priority: RequestPriority): string {
    const map: Record<RequestPriority, string> = {
      Urgent: 'urgent',
      High: 'high',
      Medium: 'medium',
      Low: 'low',
    };
    return map[priority] || '';
  }

  getPriorityIcon(priority: RequestPriority): string {
    const map: Record<RequestPriority, string> = {
      Urgent: 'local_fire_department',
      High: 'arrow_upward',
      Medium: 'remove',
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

  getAvatarClass(id: string): string {
    const num = parseInt(id.replace('REQ-', ''), 10) || 0;
    const variants = ['teal', 'blue', 'purple', 'green', 'orange', 'indigo'];
    return variants[num % variants.length];
  }
}
