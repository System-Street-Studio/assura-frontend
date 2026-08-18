import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LostItemsService, LostItem } from '../../../services/lost-items.service';

@Component({
    selector: 'app-acc-lose',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './acc-lose.html',
    styleUrls: ['./acc-lose.css']
})
export class AccLoseComponent implements OnInit {
    loseItems: LostItem[] = [];
    selectedItem: LostItem | null = null;
    isLoading = true;

    constructor(
        private lostItemsService: LostItemsService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.lostItemsService.getAll().subscribe({
            next: (data) => {
                this.loseItems = data;
                this.isLoading = false;
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error('Failed to load lost items:', err);
                this.isLoading = false;
                this.cdr.markForCheck();
            }
        });
    }

    selectItem(item: LostItem) {
        this.selectedItem = item;
    }

    closeDetail() {
        this.selectedItem = null;
    }

    getStatusClass(status: string): string {
        if (status === 'Reported') return 'reported';
        if (status === 'Under Investigation') return 'investigating';
        if (status === 'Confirmed Lost') return 'confirmed';
        return '';
    }
}
