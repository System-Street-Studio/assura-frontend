import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

interface Buyer {
    id: string;
    name: string;
    contact: string;
    email: string;
    phone: string;
    category: string;
    status: string;
}

@Component({
    selector: 'app-buyer',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './buyer.html',
    styleUrls: ['./buyer.css']
})
export class BuyerComponent implements OnInit {
    api = inject(ApiService);
    buyers: Buyer[] = [];

    selectedBuyer: Buyer | null = null;

    showAddModal = false;
    newBuyer = {
        name: '',
        contact: '',
        email: '',
        phone: '',
        category: ''
    };

    ngOnInit() {
        this.api.get<Buyer[]>('Buyers').subscribe({
            next: (data) => this.buyers = data,
            error: (err) => console.error(err)
        });
    }

    selectBuyer(buyer: Buyer) {
        this.selectedBuyer = buyer;
    }

    closeDetail() {
        this.selectedBuyer = null;
    }

    openAddModal() {
        this.showAddModal = true;
    }

    closeAddModal() {
        this.showAddModal = false;
        this.newBuyer = { name: '', contact: '', email: '', phone: '', category: '' };
    }

    submitBuyer() {
        if (!this.newBuyer.name || !this.newBuyer.contact) return;

        this.api.post('Buyers', this.newBuyer).subscribe({
            next: () => {
                this.ngOnInit(); // Refresh list
                this.closeAddModal();
            },
            error: (err) => console.error(err)
        });
    }
}
