import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReceiptsService, Receipt } from '../../../services/receipts.service';

@Component({
    selector: 'app-acc-receipt',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './acc-receipt.html',
    styleUrls: ['./acc-receipt.css']
})
export class AccReceiptComponent implements OnInit {
    receipts: Receipt[] = [];
    filteredReceipts: Receipt[] = [];
    searchTerm = '';
    showAddModal = false;
    isLoading = true;

    newReceipt = {
        assetName: '',
        division: '',
        date: '',
        amount: ''
    };

    constructor(
        private receiptsService: ReceiptsService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.loadReceipts();
    }

    private loadReceipts() {
        this.receiptsService.getAll().subscribe({
            next: (data) => {
                this.receipts = data;
                this.filteredReceipts = [...this.receipts];
                this.isLoading = false;
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error('Failed to load receipts:', err);
                this.isLoading = false;
                this.cdr.markForCheck();
            }
        });
    }

    filterReceipts() {
        const term = this.searchTerm.toLowerCase();
        this.filteredReceipts = this.receipts.filter(r =>
            r.assetName.toLowerCase().includes(term) ||
            r.division.toLowerCase().includes(term) ||
            r.amount.toLowerCase().includes(term) ||
            r.status.toLowerCase().includes(term)
        );
    }

    getStatusClass(status: string): string {
        return status.toLowerCase();
    }

    openAddReceipt() {
        this.showAddModal = true;
    }

    closeAddReceipt() {
        this.showAddModal = false;
        this.newReceipt = { assetName: '', division: '', date: '', amount: '' };
    }

    submitReceipt() {
        if (this.newReceipt.assetName && this.newReceipt.division) {
            this.receiptsService.create(this.newReceipt).subscribe({
                next: (created) => {
                    this.receipts.unshift(created);
                    this.filterReceipts();
                    this.closeAddReceipt();
                },
                error: (err) => console.error('Failed to create receipt:', err)
            });
        }
    }

    viewReceipt(item: Receipt) {
        console.log('Viewing receipt:', item.assetName);
    }

    downloadReceipt(item: Receipt) {
        console.log('Downloading receipt:', item.assetName);
    }
}
