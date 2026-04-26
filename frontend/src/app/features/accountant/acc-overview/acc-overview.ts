import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';

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
    approvedCount = 4;
    toBeApprovedCount = 5;
    pendingCount = 7;
    rejectCount = 2;

    activeFilter = 'all';

    api = inject(ApiService);
    allItems: PendingItem[] = [];

    filteredItems: PendingItem[] = [];
    selectedItem: PendingItem | null = null;
    currentPage = 1;
    totalPages = 3;
    showConfirmModal = false;
    showSuccessCard = false;

    ngOnInit() {
        this.api.get<PendingItem[]>('AccPendingItems').subscribe({
            next: (items) => {
                this.allItems = items;
                this.filteredItems = [...this.allItems];
                if (this.filteredItems.length > 0) {
                    this.selectedItem = this.filteredItems[0];
                }
            },
            error: (err) => console.error(err)
        });
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
        this.api.post(`AccPendingItems/${this.selectedItem.id}/discard`, {}).subscribe({
            next: () => {
                this.allItems = this.allItems.filter(item => item.id !== this.selectedItem!.id);
                this.filterByCategory(this.activeFilter);
                this.showConfirmModal = false;
                this.showSuccessCard = true;
                setTimeout(() => {
                    this.showSuccessCard = false;
                }, 3000);
            },
            error: (err) => console.error(err)
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
