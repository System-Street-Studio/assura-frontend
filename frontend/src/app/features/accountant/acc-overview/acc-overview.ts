import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AccPendingItemsService, AccPendingItem } from '../../../services/acc-pending-items.service';
import { ReceiptsService } from '../../../services/receipts.service';

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
    specialNote: string;
    valueAtPurchasing: string;
    currentValue: string;
    isHighlighted?: boolean;
}

@Component({
    selector: 'app-acc-overview',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './acc-overview.html',
    styleUrls: ['./acc-overview.css']
})
export class AccOverviewComponent implements OnInit {
    approvedCount = 0;
    toBeApprovedCount = 0;
    pendingCount = 0;
    rejectCount = 0;

    activeFilter: string = 'all';

    allItems: PendingItem[] = [];
    filteredItems: PendingItem[] = [];
    selectedItem: PendingItem | null = null;
    currentPage = 1;
    totalPages = 3;
    showConfirmModal = false;
    showSuccessCard = false;
    isLoading = true;
    selectedFile: File | null = null;
    selectedFileName = '';

    constructor(
        private accPendingItemsService: AccPendingItemsService,
        private receiptsService: ReceiptsService,
        private route: ActivatedRoute,
        private cdr: ChangeDetectorRef
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
        this.toBeApprovedCount = this.allItems.filter(i => i.category === 'to-be-approved').length;
        this.pendingCount = this.allItems.filter(i => i.category === 'pending').length;
        this.rejectCount = this.allItems.filter(i => i.category === 'reject').length;
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
    }

    selectItem(item: PendingItem) {
        this.selectedItem = item;
    }

    confirmDiscarding() {
        if (!this.selectedItem) return;
        this.showConfirmModal = true;
    }

    closeConfirmModal() {
        this.showConfirmModal = false;
        this.selectedFile = null;
        this.selectedFileName = '';
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.selectedFile = input.files[0];
            this.selectedFileName = input.files[0].name;
            this.cdr.markForCheck();
        }
    }

    saveAsDiscarded() {
        if (!this.selectedItem) return;

        const performDiscard = () => {
            this.accPendingItemsService.confirmDiscard(this.selectedItem!.id).subscribe({
                next: () => {
                    this.allItems = this.allItems.filter(item => item.id !== this.selectedItem!.id);
                    this.updateCounts();
                    this.filterByCategory(this.activeFilter);
                    this.showConfirmModal = false;
                    this.selectedFile = null;
                    this.selectedFileName = '';
                    this.showSuccessCard = true;
                    setTimeout(() => {
                        this.showSuccessCard = false;
                    }, 3000);
                    this.cdr.markForCheck();
                },
                error: (err) => {
                    console.error('Failed to discard item:', err);
                    this.showConfirmModal = false;
                    this.selectedFile = null;
                    this.selectedFileName = '';
                    this.cdr.markForCheck();
                }
            });
        };

        if (this.selectedFile) {
            const newReceipt = {
                assetName: this.selectedItem.name,
                division: this.selectedItem.division,
                date: this.selectedItem.date,
                amount: parseFloat(this.selectedItem.currentValue.replace(/[^0-9.]/g, '')) || 0
            };

            this.receiptsService.create(newReceipt).subscribe({
                next: (created) => {
                    this.receiptsService.uploadFile(created.id, this.selectedFile!).subscribe({
                        next: () => {
                            performDiscard();
                        },
                        error: (err) => {
                            console.error('Failed to upload receipt file:', err);
                            // Proceed with discard even if upload fails
                            performDiscard();
                        }
                    });
                },
                error: (err) => {
                    console.error('Failed to create receipt:', err);
                    performDiscard();
                }
            });
        } else {
            performDiscard();
        }
    }

    closeSuccess() {
        this.showSuccessCard = false;
    }

    goToPage(page: number) {
        this.currentPage = page;
    }

    previousPage() {
        if (this.currentPage > 1) this.currentPage--;
    }

    nextPage() {
        if (this.currentPage < this.totalPages) this.currentPage++;
    }
}
