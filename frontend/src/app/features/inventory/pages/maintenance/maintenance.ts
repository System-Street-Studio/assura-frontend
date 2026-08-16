import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MaintenanceService } from '../../services/maintenance.service';
import {
    MaintenanceRequest,
    MaintenanceStatus,
    MaintenanceStats,
    SimilarAsset
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
    private cdr = inject(ChangeDetectorRef);

    allRequests: MaintenanceRequest[] = [];
    filteredRequests: MaintenanceRequest[] = [];
    viewRequests: MaintenanceRequest[] = [];
    
    stats: MaintenanceStats | null = null;

    loading = true;
    searchTerm = '';
    filterStatus = '';

    currentPage = 1;
    pageSize = 10;
    pageSizes = [5, 10, 25, 50];
    pages: number[] = [1];

    /* ── Action modals ── */
    showActionModal = false;
    actionType: 'start' | 'complete' | 'reject' = 'start';
    actionRequest: MaintenanceRequest | null = null;
    actionProcessing = false;
    actionNotes = '';

    /* ── Assign Temp Asset Modal ── */
    showAssignModal = false;
    similarAssets: SimilarAsset[] = [];
    selectedSimilarAssetId: number | null = null;
    loadingSimilarAssets = false;

    /* ── Send For Repair Modal ── */
    showRepairModal = false;
    selectedFirmId: number | null = null;

    /* ── Escalate Modal ── */
    showEscalateModal = false;

    /* ── Inform Stakeholders ── */
    informProcessing = false;

    /* ── Detail drawer ── */
    showDetail = false;
    detailRequest: MaintenanceRequest | null = null;

    get totalPages(): number {
        return Math.ceil(this.filteredRequests.length / this.pageSize) || 1;
    }

    get showingFrom(): number {
        return this.filteredRequests.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
    }

    get showingTo(): number {
        return Math.min(this.currentPage * this.pageSize, this.filteredRequests.length);
    }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.loading = true;
        this.svc.getAll().subscribe({
            next: (data) => {
                this.allRequests = data || [];
                this.applyFilters();
                this.loadStats();
            },
            error: (err: HttpErrorResponse) => {
                if (err.status === 403) {
                    this.toast.error('You do not have permission to view maintenance records');
                } else {
                    this.toast.error('Failed to load maintenance requests');
                }
                this.loading = false;
                this.cdr.detectChanges();
            },
        });
    }

    loadStats(): void {
        this.svc.getStats().subscribe({
            next: (stats) => {
                this.stats = stats;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    applyFilters(): void {
        const term = this.searchTerm.toLowerCase().trim();

        this.filteredRequests = this.allRequests.filter((r) => {
            const matchesSearch =
                !term ||
                (r.maintenanceNumber || '').toLowerCase().includes(term) ||
                (r.assetName || '').toLowerCase().includes(term) ||
                (r.assetCode || '').toLowerCase().includes(term) ||
                (r.description || '').toLowerCase().includes(term);

            const matchesStatus = !this.filterStatus || r.status === this.filterStatus;

            return matchesSearch && matchesStatus;
        });

        this.currentPage = 1;
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
        this.updateView();
    }

    setFilterStatus(status: string): void {
        this.filterStatus = this.filterStatus === status ? '' : status;
        this.applyFilters();
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

    // ── Simple Actions ──

    openAction(type: 'start' | 'complete' | 'reject', request: MaintenanceRequest, event: Event): void {
        event.stopPropagation();
        this.actionType = type;
        this.actionRequest = request;
        this.actionNotes = '';
        this.showActionModal = true;
    }

    confirmAction(): void {
        if (!this.actionRequest) return;
        this.actionProcessing = true;

        let obs$;
        switch (this.actionType) {
            case 'start':
                obs$ = this.svc.start(this.actionRequest.id);
                break;
            case 'complete':
                obs$ = this.svc.complete(this.actionRequest.id);
                break;
            case 'reject':
                obs$ = this.svc.reject(this.actionRequest.id, this.actionNotes);
                break;
        }

        obs$.subscribe({
            next: () => {
                this.toast.success('Action successful');
                this.closeModals();
                this.loadData(); // Refresh everything
            },
            error: () => {
                this.toast.error('Action failed');
                this.actionProcessing = false;
                this.cdr.detectChanges();
            }
        });
    }

    // ── Assign Temp Asset ──

    openAssignTemp(request: MaintenanceRequest, event: Event): void {
        event.stopPropagation();
        this.actionRequest = request;
        this.showAssignModal = true;
        this.loadingSimilarAssets = true;
        this.selectedSimilarAssetId = null;
        this.actionNotes = '';

        this.svc.getSimilarAssets(request.id).subscribe({
            next: (assets) => {
                this.similarAssets = assets;
                this.loadingSimilarAssets = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.toast.error('Failed to load similar assets');
                this.loadingSimilarAssets = false;
                this.cdr.detectChanges();
            }
        });
    }

    selectSimilarAsset(id: number): void {
        this.selectedSimilarAssetId = id;
    }

    confirmAssignTemp(): void {
        if (!this.actionRequest || !this.selectedSimilarAssetId) return;
        this.actionProcessing = true;

        this.svc.assignTempAsset(this.actionRequest.id, this.selectedSimilarAssetId, this.actionNotes).subscribe({
            next: () => {
                this.toast.success('Temporary asset assigned successfully');
                this.closeModals();
                this.loadData();
            },
            error: () => {
                this.toast.error('Failed to assign temporary asset');
                this.actionProcessing = false;
                this.cdr.detectChanges();
            }
        });
    }

    // ── Send for Repair ──

    openSendForRepair(request: MaintenanceRequest, event: Event): void {
        event.stopPropagation();
        this.actionRequest = request;
        this.showRepairModal = true;
        this.selectedFirmId = null;
        this.actionNotes = '';
    }

    confirmSendForRepair(): void {
        if (!this.actionRequest) return;
        this.actionProcessing = true;

        this.svc.sendForRepair(this.actionRequest.id, this.selectedFirmId || undefined, this.actionNotes).subscribe({
            next: () => {
                this.toast.success('Asset sent for repair');
                this.closeModals();
                this.loadData();
            },
            error: () => {
                this.toast.error('Failed to update status');
                this.actionProcessing = false;
                this.cdr.detectChanges();
            }
        });
    }

    // ── Escalate ──

    openEscalate(request: MaintenanceRequest, event: Event): void {
        event.stopPropagation();
        this.actionRequest = request;
        this.showEscalateModal = true;
        this.actionNotes = '';
    }

    confirmEscalate(): void {
        if (!this.actionRequest) return;
        this.actionProcessing = true;

        this.svc.escalateToProcurement(this.actionRequest.id, this.actionNotes).subscribe({
            next: () => {
                this.toast.success('Escalated to procurement');
                this.closeModals();
                this.loadData();
            },
            error: () => {
                this.toast.error('Failed to escalate');
                this.actionProcessing = false;
                this.cdr.detectChanges();
            }
        });
    }

    // ── Inform Stakeholders ──

    informStakeholders(request: MaintenanceRequest, event: Event): void {
        event.stopPropagation();
        if (this.informProcessing) return;
        this.informProcessing = true;

        this.svc.informStakeholders(request.id).subscribe({
            next: () => {
                this.toast.success('Employee and Division Head informed');
                this.informProcessing = false;
                this.loadData();
            },
            error: () => {
                this.toast.error('Failed to inform stakeholders');
                this.informProcessing = false;
                this.cdr.detectChanges();
            }
        });
    }

    // ── Helpers ──

    closeModals(): void {
        this.showActionModal = false;
        this.showAssignModal = false;
        this.showRepairModal = false;
        this.showEscalateModal = false;
        this.actionProcessing = false;
        this.actionRequest = null;
    }

    openDetail(request: MaintenanceRequest): void {
        this.detailRequest = request;
        this.showDetail = true;
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'PendingApproval': return 'pending';
            case 'Approved': return 'approved';
            case 'InProgress': return 'in-progress';
            case 'TempAssigned': return 'assigned';
            case 'SentForRepair': return 'repair';
            case 'EscalatedToProcurement': return 'escalated';
            case 'Completed': return 'completed';
            case 'Submitted': return 'submitted';
            case 'Rejected': return 'rejected';
            default: return '';
        }
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'PendingApproval': return 'Pending Approval';
            case 'Approved': return 'Approved';
            case 'InProgress': return 'In Progress';
            case 'TempAssigned': return 'Temp Assigned';
            case 'SentForRepair': return 'Sent For Repair';
            case 'EscalatedToProcurement': return 'Escalated';
            case 'Completed': return 'Completed';
            case 'Submitted': return 'Submitted';
            case 'Rejected': return 'Rejected';
            default: return status;
        }
    }

    formatDate(dateStr: string | undefined): string {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString();
    }
}
