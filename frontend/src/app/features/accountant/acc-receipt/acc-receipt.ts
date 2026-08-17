import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReceiptsService, Receipt } from '../../../services/receipts.service';

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

@Component({
    selector: 'app-acc-receipt',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
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
    fileError = '';
    submitAttempted = false;
    listActionError = '';

    receiptForm: FormGroup;

    constructor(
        private receiptsService: ReceiptsService,
        private cdr: ChangeDetectorRef,
        private fb: FormBuilder
    ) {
        this.receiptForm = this.fb.group({
            assetName: ['', [Validators.required, Validators.maxLength(200)]],
            division: ['', [Validators.required, Validators.maxLength(100)]],
            date: ['', [Validators.required]],
            amount: [null, [Validators.required, Validators.min(0.01)]]
        });
    }

    preventNegative(event: KeyboardEvent) {
        if (event.key === '-' || event.key === 'e' || event.key === 'E' || event.key === '+') {
            event.preventDefault();
        }
    }

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
            r.amount.toString().includes(term) ||
            r.status.toLowerCase().includes(term)
        );
    }

    getStatusClass(status: string): string {
        return status.toLowerCase();
    }

    isInvalid(controlName: string): boolean {
        const control = this.receiptForm.get(controlName);
        if (!control) return false;
        return control.invalid && (control.touched || this.submitAttempted);
    }

    openAddReceipt() {
        this.showAddModal = true;
        this.selectedFile = null;
        this.selectedFileName = '';
        this.createdReceiptId = null;
        this.uploadError = '';
        this.fileError = '';
        this.submitAttempted = false;
        this.receiptForm.reset();
    }

    closeAddReceipt() {
        this.showAddModal = false;
        this.receiptForm.reset();
        this.selectedFile = null;
        this.selectedFileName = '';
        this.createdReceiptId = null;
        this.uploadError = '';
        this.fileError = '';
        this.submitAttempted = false;
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        this.fileError = '';
        if (input.files && input.files.length > 0) {
            const file = input.files[0];

            if (!ALLOWED_FILE_TYPES.includes(file.type)) {
                this.fileError = 'Only PDF, JPG, and PNG files are allowed.';
                this.selectedFile = null;
                this.selectedFileName = '';
                input.value = '';
                return;
            }

            if (file.size > MAX_UPLOAD_BYTES) {
                this.fileError = 'File must be smaller than 5MB.';
                this.selectedFile = null;
                this.selectedFileName = '';
                input.value = '';
                return;
            }

            this.selectedFile = file;
            this.selectedFileName = file.name;
        }
    }

    submitReceipt() {
        this.submitAttempted = true;
        if (this.receiptForm.invalid) {
            this.receiptForm.markAllAsTouched();
            return;
        }

        this.receiptsService.create(this.receiptForm.value).subscribe({
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
        this.listActionError = '';
        if (item.fileUrl) {
            window.open(item.fileUrl, '_blank');
        } else {
            this.listActionError = `No file attached to receipt for "${item.assetName}".`;
        }
    }

    downloadReceipt(item: Receipt) {
        this.listActionError = '';
        if (!item.fileUrl) {
            this.listActionError = `No file attached to receipt for "${item.assetName}".`;
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
            .catch(() => {
                this.listActionError = 'Failed to download file.';
                this.cdr.markForCheck();
            });
    }

    dismissListActionError() {
        this.listActionError = '';
    }
}
