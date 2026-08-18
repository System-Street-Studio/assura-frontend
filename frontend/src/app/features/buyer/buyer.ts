import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BuyersService, Buyer } from '../../services/buyers.service';

@Component({
    selector: 'app-buyer',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './buyer.html',
    styleUrls: ['./buyer.css']
})
export class BuyerComponent implements OnInit {
    buyers: Buyer[] = [];
    filteredBuyers: Buyer[] = [];
    searchQuery = '';
    statusFilter = '';
    selectedBuyer: Buyer | null = null;
    isLoading = true;

    get activeCount() { return this.buyers.filter(b => b.status === 'Active').length; }
    get inactiveCount() { return this.buyers.filter(b => b.status === 'Inactive').length; }
    get pendingCount() { return this.buyers.filter(b => b.status === 'Pending').length; }
    get totalCount() { return this.buyers.length; }

    // Add & Edit modal state
    showAddModal = false;
    showEditModal = false;
    isSubmitting = false;
    editingBuyerId: number | null = null;
    addBuyerForm: FormGroup;
    editBuyerForm: FormGroup;

    constructor(
        private buyersService: BuyersService,
        private cdr: ChangeDetectorRef,
        private fb: FormBuilder
    ) {
        this.addBuyerForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
            contact: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
            email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
            phone: ['', [Validators.required, Validators.pattern(/^0\d{9}$/)]],
            category: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]]
        });

        this.editBuyerForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
            contact: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
            email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
            phone: ['', [Validators.required, Validators.pattern(/^0\d{9}$/)]],
            category: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
            status: ['Active', Validators.required]
        });
    }

    allowOnlyNumbers(event: KeyboardEvent): void {
        const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];
        if (allowedKeys.includes(event.key)) {
            return;
        }
        if (!/^[0-9]$/.test(event.key)) {
            event.preventDefault();
        }
    }

    get f() { return this.addBuyerForm.controls; }
    get editF() { return this.editBuyerForm.controls; }

    ngOnInit() {
        this.loadBuyers();
    }

    loadBuyers() {
        this.isLoading = true;
        this.buyersService.getAll().subscribe({
            next: (data) => {
                this.buyers = data;
                this.applyFilters();
                this.isLoading = false;
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error('Failed to load buyers:', err);
                this.isLoading = false;
                this.cdr.markForCheck();
            }
        });
    }

    onSearch() {
        this.applyFilters();
    }

    filterByStatus(status: string) {
        this.statusFilter = this.statusFilter === status ? '' : status;
        this.applyFilters();
    }

    private applyFilters() {
        const query = this.searchQuery.toLowerCase();
        this.filteredBuyers = this.buyers.filter(buyer => {
            const matchesSearch =
                (buyer.name ?? '').toLowerCase().includes(query) ||
                (buyer.category ?? '').toLowerCase().includes(query);
            const matchesStatus = !this.statusFilter || buyer.status === this.statusFilter;
            return matchesSearch && matchesStatus;
        });
    }

    selectBuyer(buyer: Buyer) {
        this.selectedBuyer = buyer;
    }

    closeDetail() {
        this.selectedBuyer = null;
    }

    openAddModal() {
        this.addBuyerForm.reset({ name: '', contact: '', email: '', phone: '', category: '' });
        this.showAddModal = true;
    }

    closeAddModal() {
        this.showAddModal = false;
    }

    submitAddBuyer() {
        if (this.addBuyerForm.invalid) {
            this.addBuyerForm.markAllAsTouched();
            return;
        }
        this.isSubmitting = true;
        const formVal = this.addBuyerForm.value;
        const payload = {
            name: (formVal.name ?? '').trim(),
            contact: (formVal.contact ?? '').trim(),
            email: (formVal.email ?? '').trim(),
            phone: (formVal.phone ?? '').trim(),
            category: (formVal.category ?? '').trim()
        };
        this.buyersService.create(payload).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.showAddModal = false;
                this.loadBuyers();
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error('Failed to add buyer:', err);
                this.isSubmitting = false;
                alert('Failed to add buyer. Please check input values and try again.');
                this.cdr.markForCheck();
            }
        });
    }

    openEditModal(buyer: Buyer, event?: Event) {
        if (event) {
            event.stopPropagation();
        }
        this.editingBuyerId = parseInt(buyer.id, 10);
        this.editBuyerForm.reset({
            name: buyer.name,
            contact: buyer.contact,
            email: buyer.email,
            phone: buyer.phone,
            category: buyer.category,
            status: buyer.status || 'Active'
        });
        this.showEditModal = true;
    }

    closeEditModal() {
        this.showEditModal = false;
        this.editingBuyerId = null;
    }

    submitEditBuyer() {
        if (this.editBuyerForm.invalid || !this.editingBuyerId) {
            this.editBuyerForm.markAllAsTouched();
            return;
        }
        this.isSubmitting = true;
        const formVal = this.editBuyerForm.value;
        const payload = {
            id: this.editingBuyerId,
            name: (formVal.name ?? '').trim(),
            contact: (formVal.contact ?? '').trim(),
            email: (formVal.email ?? '').trim(),
            phone: (formVal.phone ?? '').trim(),
            category: (formVal.category ?? '').trim(),
            status: formVal.status ?? 'Active'
        };

        this.buyersService.update(this.editingBuyerId, payload).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.showEditModal = false;
                if (this.selectedBuyer && this.selectedBuyer.id === String(this.editingBuyerId)) {
                    this.selectedBuyer = {
                        ...this.selectedBuyer,
                        ...payload,
                        id: String(this.editingBuyerId)
                    };
                }
                this.editingBuyerId = null;
                this.loadBuyers();
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error('Failed to update buyer:', err);
                this.isSubmitting = false;
                let message = 'Failed to update buyer. Please check input values and try again.';
                if (err?.error?.errors && typeof err.error.errors === 'object') {
                    const messages = Object.values(err.error.errors).flat();
                    if (messages.length > 0) message = messages.join('\n');
                } else if (typeof err?.error === 'string' && err.error.trim()) {
                    message = err.error;
                } else if (err?.error?.message) {
                    message = err.error.message;
                } else if (err?.message) {
                    message = err.message;
                }
                alert(message);
                this.cdr.markForCheck();
            }
        });
    }
}
