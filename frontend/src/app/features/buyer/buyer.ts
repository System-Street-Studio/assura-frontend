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

    // Add modal state
    showAddModal = false;
    isSubmitting = false;
    addBuyerForm: FormGroup;

    constructor(
        private buyersService: BuyersService,
        private cdr: ChangeDetectorRef,
        private fb: FormBuilder
    ) {
        this.addBuyerForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            contact: ['', Validators.required],
            email: ['', Validators.email],
            phone: ['', Validators.pattern(/^[0-9+\-\s()]{7,20}$/)],
            category: ['']
        });
    }

    get f() { return this.addBuyerForm.controls; }

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
        this.buyersService.create(this.addBuyerForm.value).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.showAddModal = false;
                this.loadBuyers();
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error('Failed to add buyer:', err);
                this.isSubmitting = false;
                alert('Failed to add buyer. Please try again.');
                this.cdr.markForCheck();
            }
        });
    }
}
