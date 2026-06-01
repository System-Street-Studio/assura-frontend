import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccPendingItemsService, AccPendingItem } from '../../../services/acc-pending-items.service';

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

    constructor(
        private accPendingItemsService: AccPendingItemsService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.accPendingItemsService.getAll().subscribe({
            next: (data) => {
                this.allItems = data;
                this.filteredItems = [...this.allItems];
                if (this.filteredItems.length > 0) {
                    this.selectedItem = this.filteredItems[0];
                }
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
    }

    saveAsDiscarded() {
        if (!this.selectedItem) return;

        this.accPendingItemsService.confirmDiscard(this.selectedItem.id).subscribe({
            next: () => {
                this.allItems = this.allItems.filter(item => item.id !== this.selectedItem!.id);
                this.updateCounts();
                this.filterByCategory(this.activeFilter);
                this.showConfirmModal = false;
                this.showSuccessCard = true;
                setTimeout(() => {
                    this.showSuccessCard = false;
                }, 3000);
            },
            error: (err) => {
                console.error('Failed to discard item:', err);
                this.showConfirmModal = false;
            }
        });
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
