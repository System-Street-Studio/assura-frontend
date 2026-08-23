import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { AccPendingItemsService, AccPendingItem } from '../../../services/acc-pending-items.service';
import { ReceiptsService } from '../../../services/receipts.service';
import { ToastService } from '../../../shared/services/toast.service';

interface PendingItem {
    id: string;
    name: string;
    division: string;
    date: string;
    status: string;
    category: string;
    time: string;
    assetType: string;
    currentUser: string;
    requestedByName: string;
    assigneeName?: string;
    specialNote: string;
    valueAtPurchasing: string;
    currentValue: string;
    isHighlighted?: boolean;
    buyerName?: string | null;
    soldPrice?: number | null;
}

@Component({
    selector: 'app-acc-overview',
    standalone: true,
    imports: [CommonModule, PaginationComponent],
    templateUrl: './acc-overview.html',
    styleUrls: ['./acc-overview.css']
})
export class AccOverviewComponent implements OnInit {
    approvedCount = 0;
    pendingCount = 0;

    activeFilter: string = 'all';

    allItems: PendingItem[] = [];
    filteredItems: PendingItem[] = [];
    pagedItems: PendingItem[] = [];
    selectedItem: PendingItem | null = null;
    currentPage = 1;
    pageSize = 8;
    totalPages = 1;
    showConfirmModal = false;
    fileError = false;
    fileErrorMessage = '';
    isSaving = false;
    isLoading = true;
    selectedFile: File | null = null;
    selectedFileName = '';

    constructor(
        private accPendingItemsService: AccPendingItemsService,
        private receiptsService: ReceiptsService,
        private route: ActivatedRoute,
        private cdr: ChangeDetectorRef,
        private toastService: ToastService
    ) {}

    ngOnInit() {
        this.accPendingItemsService.getAll().subscribe({
            next: (data) => {
                this.allItems = data;
                this.filteredItems = [...this.allItems];

                this.route.queryParams.subscribe(params => {
                    const selectId = params['selectId'];
                    if (selectId) {
                        const found = this.allItems.find(item => item.id === selectId);
                        if (found) {
                            this.activeFilter = found.category;
                            this.filterByCategory(found.category);
                            this.selectedItem = found;
                        }
                    } else if (this.filteredItems.length > 0) {
                        this.selectedItem = this.filteredItems[0];
                    }
                    this.cdr.markForCheck();
                });

                this.updateCounts();
                this.updatePagination();
                this.isLoading = false;
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error('Failed to load pending items:', err);
                this.isLoading = false;
                this.cdr.markForCheck();
            }
        });
    }

    private updateCounts() {
        this.approvedCount = this.allItems.filter(i => i.category === 'approved').length;
        this.pendingCount = this.allItems.filter(i => i.category === 'pending').length;
    }

    filterByCategory(category: string) {
        this.activeFilter = category;
        if (category === 'all') {
            this.filteredItems = [...this.allItems];
        } else {
            this.filteredItems = this.allItems.filter(item => item.category === category);
        }
        this.selectedItem = this.filteredItems.length > 0 ? this.filteredItems[0] : null;
        this.currentPage = 1;
        this.updatePagination();
    }

    private updatePagination() {
        this.totalPages = Math.max(1, Math.ceil(this.filteredItems.length / this.pageSize));
        if (this.currentPage > this.totalPages) {
            this.currentPage = this.totalPages;
        }
        const start = (this.currentPage - 1) * this.pageSize;
        this.pagedItems = this.filteredItems.slice(start, start + this.pageSize);
    }

    selectItem(item: PendingItem) {
        this.selectedItem = item;
    }

    confirmDiscarding() {
        if (!this.selectedItem) return;
        this.fileError = false;
        this.fileErrorMessage = '';
        this.showConfirmModal = true;
    }

    closeConfirmModal() {
        this.showConfirmModal = false;
        this.selectedFile = null;
        this.selectedFileName = '';
        this.fileError = false;
        this.fileErrorMessage = '';
        this.isSaving = false;
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.selectedFile = input.files[0];
            this.selectedFileName = input.files[0].name;
            this.fileError = false;
            this.fileErrorMessage = '';
            this.cdr.markForCheck();
        }
    }

    saveAsDiscarded() {
        if (!this.selectedItem) return;

        // Validation: Receipt file is required
        if (!this.selectedFile) {
            this.fileError = true;
            this.fileErrorMessage = 'Please upload a receipt before confirming discard.';
            this.toastService.error('Receipt is required to confirm discard. Please upload a receipt file.');
            this.cdr.markForCheck();
            return;
        }

        this.isSaving = true;
        this.fileError = false;
        this.fileErrorMessage = '';

        const rawAmount = parseFloat(
            (this.selectedItem.currentValue || '').replace(/[^0-9.]/g, '')
        ) || parseFloat(
            (this.selectedItem.valueAtPurchasing || '').replace(/[^0-9.]/g, '')
        ) || 0;

        const newReceipt = {
            assetName: this.selectedItem.name || 'Asset',
            division: this.selectedItem.division || 'General',
            date: this.selectedItem.date || new Date().toISOString().split('T')[0],
            amount: rawAmount >= 0 ? rawAmount : 0
        };

        this.receiptsService.create(newReceipt).subscribe({
            next: (created) => {
                this.receiptsService.uploadFile(created.id, this.selectedFile!).subscribe({
                    next: () => {
                        this.accPendingItemsService.confirmDiscard(this.selectedItem!.id, created.id).subscribe({
                            next: () => {
                                this.allItems = this.allItems.filter(item => item.id !== this.selectedItem!.id);
                                this.updateCounts();
                                this.filterByCategory(this.activeFilter);
                                this.closeConfirmModal();
                                this.isSaving = false;
                                this.toastService.success('Saved As Discarded');
                                this.cdr.markForCheck();
                            },
                            error: (err) => {
                                console.error('Failed to discard item:', err);
                                this.isSaving = false;
                                this.toastService.error('Failed to confirm discard. Please try again.');
                                this.cdr.markForCheck();
                            }
                        });
                    },
                    error: (err) => {
                        console.error('Failed to upload receipt file:', err);
                        this.isSaving = false;
                        this.toastService.error('Failed to upload receipt file. Please try again.');
                        this.cdr.markForCheck();
                    }
                });
            },
            error: (err) => {
                console.error('Failed to create receipt record:', err);
                this.isSaving = false;
                this.toastService.error('Failed to create receipt. Please try again.');
                this.cdr.markForCheck();
            }
        });
    }

    getPageNumbers(): number[] {
        const pages: number[] = [];
        for (let i = 1; i <= this.totalPages; i++) {
            pages.push(i);
        }
        return pages;
    }

    onPageChange(page: number) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.updatePagination();
        }
    }

    goToPage(page: number) {
        this.currentPage = page;
        this.updatePagination();
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updatePagination();
        }
    }

    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.updatePagination();
        }
    }
}
