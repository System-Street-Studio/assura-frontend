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
    selectedFile: File | null = null;
    selectedFileName = '';
    createdReceiptId: string | null = null;
    uploadError = '';

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
        this.selectedFile = null;
        this.selectedFileName = '';
        this.createdReceiptId = null;
        this.uploadError = '';
    }

    closeAddReceipt() {
        this.showAddModal = false;
        this.newReceipt = { assetName: '', division: '', date: '', amount: '' };
        this.selectedFile = null;
        this.selectedFileName = '';
        this.createdReceiptId = null;
        this.uploadError = '';
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.selectedFile = input.files[0];
            this.selectedFileName = input.files[0].name;
        }
    }

    submitReceipt() {
        if (!this.newReceipt.assetName || !this.newReceipt.division) return;

        this.receiptsService.create(this.newReceipt).subscribe({
            next: (created) => {
                if (this.selectedFile) {
                    // Upload the file right after creation
                    this.receiptsService.uploadFile(created.id, this.selectedFile).subscribe({
                        next: (updated) => {
                            this.receipts.unshift(updated);
                            this.filterReceipts();
                            this.closeAddReceipt();
                        },
                        error: (err) => {
                            // Still add the receipt even if upload fails
                            this.receipts.unshift(created);
                            this.filterReceipts();
                            this.uploadError = 'Receipt created but file upload failed.';
                            this.cdr.markForCheck();
                        }
                    });
                } else {
                    this.receipts.unshift(created);
                    this.filterReceipts();
                    this.closeAddReceipt();
                }
            },
            error: (err) => console.error('Failed to create receipt:', err)
        });
    }

    viewReceipt(item: Receipt) {
        if (item.fileUrl) {
            window.open(item.fileUrl, '_blank');
        } else {
            alert(`No file attached to receipt for "${item.assetName}".`);
        }
    }

    downloadReceipt(item: Receipt) {
        if (!item.fileUrl) {
            alert(`No file attached to receipt for "${item.assetName}".`);
            return;
        }

        // Fetch as blob so the browser downloads instead of navigating
        fetch(item.fileUrl)
            .then(res => res.blob())
            .then(blob => {
                const ext = item.fileUrl!.split('.').pop() || 'pdf';
                const fileName = `receipt_${item.assetName.replace(/\s+/g, '_')}.${ext}`;
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                a.click();
                URL.revokeObjectURL(url);
            })
            .catch(() => alert('Failed to download file.'));
    }
}

