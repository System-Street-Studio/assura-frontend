import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MaintenanceService } from '../../services/maintenance.service';
import {
    MaintenanceRequest,
    MaintenanceStatus,
    MaintenancePriority,
} from '../../models/maintenance.model';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
    selector: 'app-maintenance',
    standalone: true,
    imports: [CommonModule, FormsModule, MatIconModule],
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
    filterPriority = '';
    filterDepartment = '';

    currentPage = 1;
    pageSize = 10;
    pageSizes = [5, 10, 25, 50];

    /* ── Action modal ── */
    showActionModal = false;
    actionType: 'start' | 'forward' | 'reject' | 'complete' = 'start';
    actionRequest: MaintenanceRequest | null = null;
    actionNotes = '';
    actionProcessing = false;

    /* ── Assign modal ── */
    showAssignModal = false;
    assignRequest: MaintenanceRequest | null = null;
    replacementAssetId = '';
    assignNotes = '';
    assignProcessing = false;

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

    get forwardedCount(): number {
        return this.allRequests.filter((r) => r.status === 'Forwarded').length;
    }

    get rejectedCount(): number {
        return this.allRequests.filter((r) => r.status === 'Rejected').length;
    }

    get departments(): string[] {
        const depts = new Set(this.allRequests.map((r) => r.department));
        return Array.from(depts).sort();
    }

    get statuses(): MaintenanceStatus[] {
        return ['Pending', 'In Progress', 'Completed', 'Forwarded', 'Rejected'];
    }

    get priorities(): MaintenancePriority[] {
        return ['Critical', 'High', 'Medium', 'Low'];
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
                this.toast.show('Failed to load maintenance requests', 'error');
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
                r.id.toLowerCase().includes(term) ||
                r.assetName.toLowerCase().includes(term) ||
                r.assetId.toLowerCase().includes(term) ||
                r.requestedBy.toLowerCase().includes(term) ||
                r.department.toLowerCase().includes(term) ||
                r.description.toLowerCase().includes(term) ||
                r.issueType.toLowerCase().includes(term);

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
    openAction(type: 'start' | 'forward' | 'reject' | 'complete', request: MaintenanceRequest, event: Event): void {
        event.stopPropagation();
        this.actionType = type;
        this.actionRequest = request;
        this.actionNotes = '';
        this.showActionModal = true;
    }

    cancelAction(): void {
        this.showActionModal = false;
        this.actionRequest = null;
    }

    getActionTitle(): string {
        const map = {
            start: 'Start Repair',
            forward: 'Forward to Procurement',
            reject: 'Reject Request',
            complete: 'Mark as Completed',
        };
        return map[this.actionType];
    }

    getActionIcon(): string {
        const map = {
            start: 'build',
            forward: 'send',
            reject: 'cancel',
            complete: 'check_circle',
        };
        return map[this.actionType];
    }

    getActionStatus(): MaintenanceStatus {
        const map: Record<string, MaintenanceStatus> = {
            start: 'In Progress',
            forward: 'Forwarded',
            reject: 'Rejected',
            complete: 'Completed',
        };
        return map[this.actionType];
    }

    confirmAction(): void {
        if (!this.actionRequest) return;
        this.actionProcessing = true;

        const newStatus = this.getActionStatus();

        this.svc.updateStatus(this.actionRequest.id, newStatus, this.actionNotes).subscribe({
            next: (updated: MaintenanceRequest) => {
                const idx = this.allRequests.findIndex((r) => r.id === updated.id);
                if (idx !== -1) this.allRequests[idx] = updated;
                this.applyFilters();

                this.showActionModal = false;
                this.actionProcessing = false;

                this.toast.show(`Request ${updated.id} has been updated to "${newStatus}"`, 'success');
            },
            error: () => {
                this.actionProcessing = false;
                this.toast.show('Action failed. Please try again.', 'error');
            },
        });
    }

    /* ── Assign replacement ── */
    openAssign(request: MaintenanceRequest, event: Event): void {
        event.stopPropagation();
        this.assignRequest = request;
        this.replacementAssetId = '';
        this.assignNotes = '';
        this.showAssignModal = true;
    }

    cancelAssign(): void {
        this.showAssignModal = false;
        this.assignRequest = null;
    }

    confirmAssign(): void {
        if (!this.assignRequest || !this.replacementAssetId.trim()) return;
        this.assignProcessing = true;

        this.svc.assignReplacement(this.assignRequest.id, this.replacementAssetId, this.assignNotes).subscribe({
            next: (updated: MaintenanceRequest) => {
                const idx = this.allRequests.findIndex((r) => r.id === updated.id);
                if (idx !== -1) this.allRequests[idx] = updated;
                this.applyFilters();

                this.showAssignModal = false;
                this.assignProcessing = false;

                this.toast.show(`Replacement assigned for ${updated.id}`, 'success');
            },
            error: () => {
                this.assignProcessing = false;
                this.toast.show('Assignment failed. Please try again.', 'error');
            },
        });
    }

    /* ── Detail drawer ── */
    openDetail(request: MaintenanceRequest): void {
        this.detailRequest = request;
        this.showDetail = true;
    }

    closeDetail(): void {
        this.showDetail = false;
        this.detailRequest = null;
    }

    /* ── Helpers ── */
    getStatusClass(status: MaintenanceStatus): string {
        const map: Record<MaintenanceStatus, string> = {
            Pending: 'pending',
            'In Progress': 'in-progress',
            Completed: 'completed',
            Forwarded: 'forwarded',
            Rejected: 'rejected',
        };
        return map[status] || '';
    }

    getPriorityClass(priority: MaintenancePriority): string {
        const map: Record<MaintenancePriority, string> = {
            Critical: 'critical',
            High: 'high',
            Medium: 'medium',
            Low: 'low',
        };
        return map[priority] || '';
    }

    getPriorityIcon(priority: MaintenancePriority): string {
        const map: Record<MaintenancePriority, string> = {
            Critical: 'local_fire_department',
            High: 'arrow_upward',
            Medium: 'remove',
            Low: 'arrow_downward',
        };
        return map[priority] || 'remove';
    }

    getIssueIcon(issueType: string): string {
        const map: Record<string, string> = {
            'Hardware Failure': 'memory',
            'Software Issue': 'bug_report',
            'Physical Damage': 'broken_image',
            Other: 'help_outline',
        };
        return map[issueType] || 'help_outline';
    }

    getTypeIcon(type: string): string {
        return type === 'Replace' ? 'swap_horiz' : 'build';
    }

    formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
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

    getInitials(name: string): string {
        return name
            .split(' ')
            .map((w) => w[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
    }
}
