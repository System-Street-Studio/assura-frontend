import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccDiscardedItemsService, AccDiscardedItem } from '../../../services/acc-discarded-items.service';

@Component({
    selector: 'app-acc-discarded',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './acc-discarded.html',
    styleUrls: ['./acc-discarded.css']
})
export class AccDiscardedComponent implements OnInit {
    discardedItems: AccDiscardedItem[] = [];
    selectedItem: AccDiscardedItem | null = null;
    showSuccessCard = false;
    isDownloaded = false;
    isLoading = true;

    constructor(
        private accDiscardedItemsService: AccDiscardedItemsService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.accDiscardedItemsService.getAll().subscribe({
            next: (data) => {
                this.discardedItems = data;
                this.isLoading = false;
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error('Failed to load discarded items:', err);
                this.isLoading = false;
                this.cdr.markForCheck();
            }
        });
    }

    selectItem(item: AccDiscardedItem) {
        this.selectedItem = this.selectedItem === item ? null : item;
    }

    downloadReceipt() {
        this.isDownloaded = true;
    }

    closeDetail() {
        this.selectedItem = null;
    }
}
