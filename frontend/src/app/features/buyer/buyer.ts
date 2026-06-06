import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BuyersService, Buyer, CreateBuyerRequest } from '../../services/buyers.service';

@Component({
    selector: 'app-buyer',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './buyer.html',
    styleUrls: ['./buyer.css']
})
export class BuyerComponent implements OnInit {
    buyers: Buyer[] = [];
    selectedBuyer: Buyer | null = null;
    isLoading = true;

    // Add modal state
    showAddModal = false;
    isSubmitting = false;
    newBuyer: CreateBuyerRequest = {
        name: '', contact: '', email: '', phone: '', category: ''
    };

    constructor(
        private buyersService: BuyersService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.loadBuyers();
    }

    loadBuyers() {
        this.isLoading = true;
        this.buyersService.getAll().subscribe({
            next: (data) => {
                this.buyers = data;
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

    selectBuyer(buyer: Buyer) {
        this.selectedBuyer = buyer;
    }

    closeDetail() {
        this.selectedBuyer = null;
    }

    openAddModal() {
        this.newBuyer = { name: '', contact: '', email: '', phone: '', category: '' };
        this.showAddModal = true;
    }

    closeAddModal() {
        this.showAddModal = false;
    }

    submitAddBuyer() {
        if (!this.newBuyer.name || !this.newBuyer.contact) {
            alert('Please fill in Name and Contact Person.');
            return;
        }
        this.isSubmitting = true;
        this.buyersService.create(this.newBuyer).subscribe({
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
