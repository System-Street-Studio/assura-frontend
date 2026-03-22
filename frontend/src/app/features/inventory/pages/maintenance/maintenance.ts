import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MaintenanceService } from '../../services/maintenance.service';
import {
    MaintenanceRequest,
    MaintenanceStatus,
} from '../../models/maintenance.model';
import { ToastService } from '../../../../shared/services/toast.service';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';

@Component({
    selector: 'app-maintenance',
    standalone: true,
    imports: [CommonModule, FormsModule, MatIconModule, PaginationComponent],
    templateUrl: './maintenance.html',
    styleUrls: ['./maintenance.css'],
})
export class MaintenanceComponent implements OnInit {
    private svc = inject(MaintenanceService);
    private toast = inject(ToastService);

    allRequests: MaintenanceRequest[] = [];
    filteredRequests: MaintenanceRequest[] = [];
    viewRequests: MaintenanceRequest[] = [];

    loading = true;
    searchTerm = '';
    filterStatus = '';

    currentPage = 1;
    pageSize = 10;
    pageSizes = [5, 10, 25, 50];

    /* ── Action modal ── */
    showActionModal = false;
    actionType: 'start' | 'complete' | 'forward' | 'reject' = 'start';
    actionRequest: MaintenanceRequest | null = null;
    actionProcessing = false;

    /* ── Detail drawer ── */
    showDetail = false;
    detailRequest: MaintenanceRequest | null = null;

    /* ── Stats ── */
    get totalCount(): number {
        return this.allRequests.length;
    }

    get pendingCount(): number {
        return this.allRequests.filter((r) => r.status === 'Pending').length;
    }

    get inProgressCount(): number {
        return this.allRequests.filter((r) => r.status === 'In Progress').length;
    }

    get completedCount(): number {
        return this.allRequests.filter((r) => r.status === 'Completed').length;
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
        this.svc.getAll().subscribe({
            next: (data: MaintenanceRequest[]) => {
                this.allRequests = data;
                this.applyFilters();
                this.loading = false;
            },
            error: () => {
                this.toast.error('Failed to load maintenance requests');
                this.loading = false;
            },
        });
    }

    applyFilters(): void {
        const term = this.searchTerm.toLowerCase().trim();

        this.filteredRequests = this.allRequests.filter((r) => {
            const matchesSearch =
                !term ||
                r.maintenanceNumber.toLowerCase().includes(term) ||
                r.assetName.toLowerCase().includes(term) ||
                r.assetId.toLowerCase().includes(term) ||
                r.description.toLowerCase().includes(term);

            const matchesStatus = !this.filterStatus || r.status === this.filterStatus;

            return matchesSearch && matchesStatus;
        });

        this.currentPage = 1;
        this.updateView();
    }

    clearFilters(): void {
        this.searchTerm = '';
        this.filterStatus = '';
        this.applyFilters();
    }

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

    toggleSelectAll(): void {
        const target = !this.allSelected;
        this.viewRequests.forEach((r) => (r.selected = target));
    }

    openAction(type: 'start' | 'complete' | 'forward' | 'reject', request: MaintenanceRequest, event: Event): void {
        event.stopPropagation();
        this.actionType = type;
        this.actionRequest = request;
        this.showActionModal = true;
    }

    confirmAction(): void {
        if (!this.actionRequest) return;
        this.actionProcessing = true;

        const newStatus: MaintenanceStatus =
            this.actionType === 'start' ? 'In Progress' :
                this.actionType === 'complete' ? 'Completed' :
                    this.actionType === 'forward' ? 'Forwarded' : 'Rejected';

        this.svc.updateStatus(this.actionRequest.maintenanceNumber, newStatus).subscribe({
            next: (updated: MaintenanceRequest) => {
                const idx = this.allRequests.findIndex((r) => r.maintenanceNumber === updated.maintenanceNumber);
                if (idx !== -1) this.allRequests[idx] = updated;
                this.applyFilters();
                this.showActionModal = false;
                this.actionProcessing = false;
                this.toast.success(`Request ${updated.maintenanceNumber} updated to ${newStatus}`);
            },
            error: () => {
                this.actionProcessing = false;
                this.toast.error('Action failed');
            },
        });
    }

    openDetail(request: MaintenanceRequest): void {
        this.detailRequest = request;
        this.showDetail = true;
    }

    getStatusClass(status: MaintenanceStatus): string {
        switch (status) {
            case 'Pending': return 'pending';
            case 'In Progress': return 'in-progress';
            case 'Completed': return 'completed';
            case 'Forwarded': return 'forwarded';
            case 'Rejected': return 'rejected';
            default: return '';
        }
    }

    formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString();
    }
}
