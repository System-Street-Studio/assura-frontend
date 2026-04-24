import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ReceiptItem {
    id: string;
    assetName: string;
    division: string;
    date: string;
    amount: string;
    status: string;
}

@Component({
    selector: 'app-acc-receipt',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './acc-receipt.html',
    styleUrls: ['./acc-receipt.css']
})
export class AccReceiptComponent implements OnInit {
    receipts: ReceiptItem[] = [
        { id: '1', assetName: 'Dell XPS 15 Laptop', division: 'Information Technology', date: '20 Feb 2026', amount: 'Rs. 45,000', status: 'Uploaded' },
        { id: '2', assetName: 'HP LaserJet Printer', division: 'Admin', date: '18 Feb 2026', amount: 'Rs. 12,500', status: 'Pending' },
        { id: '3', assetName: 'MacBook Pro 14', division: 'Design', date: '15 Feb 2026', amount: 'Rs. 85,000', status: 'Uploaded' },
        { id: '4', assetName: 'Cisco Router 2901', division: 'Information Technology', date: '12 Feb 2026', amount: 'Rs. 32,000', status: 'Uploaded' },
        { id: '5', assetName: 'Samsung Monitor 27"', division: 'Design', date: '10 Feb 2026', amount: 'Rs. 18,500', status: 'Pending' },
        { id: '6', assetName: 'Lenovo ThinkPad X1', division: 'Finance', date: '08 Feb 2026', amount: 'Rs. 62,000', status: 'Uploaded' },
        { id: '7', assetName: 'Canon Scanner DR-C225', division: 'Admin', date: '05 Feb 2026', amount: 'Rs. 9,800', status: 'Pending' },
        { id: '8', assetName: 'APC UPS 1500VA', division: 'Information Technology', date: '02 Feb 2026', amount: 'Rs. 15,000', status: 'Uploaded' },
        { id: '9', assetName: 'Epson Projector EB-X41', division: 'Marketing', date: '28 Jan 2026', amount: 'Rs. 28,000', status: 'Uploaded' },
        { id: '10', assetName: 'Microsoft Surface Pro', division: 'HR', date: '25 Jan 2026', amount: 'Rs. 72,000', status: 'Pending' },
        { id: '11', assetName: 'Logitech Webcam C920', division: 'IT Support', date: '20 Jan 2026', amount: 'Rs. 4,500', status: 'Uploaded' },
        { id: '12', assetName: 'Brother Printer MFC', division: 'Admin', date: '15 Jan 2026', amount: 'Rs. 22,000', status: 'Pending' }
    ];

    filteredReceipts: ReceiptItem[] = [];
    searchTerm = '';
    showAddModal = false;

    newReceipt = {
        assetName: '',
        division: '',
        date: '',
        amount: ''
    };

    ngOnInit() {
        this.filteredReceipts = [...this.receipts];
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
            const newItem: ReceiptItem = {
                id: (this.receipts.length + 1).toString(),
                assetName: this.newReceipt.assetName,
                division: this.newReceipt.division,
                date: this.newReceipt.date || 'N/A',
                amount: this.newReceipt.amount || 'N/A',
                status: 'Pending'
            };
            this.receipts.unshift(newItem);
            this.filterReceipts();
            this.closeAddReceipt();
        }
    }

    viewReceipt(item: ReceiptItem) {
        console.log('Viewing receipt:', item.assetName);
    }

    downloadReceipt(item: ReceiptItem) {
        console.log('Downloading receipt:', item.assetName);
    }
}
