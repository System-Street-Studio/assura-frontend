import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms'; // For search input if needed

@Component({
    selector: 'app-purchase-orders',
    standalone: true,
    imports: [CommonModule, MatIconModule, FormsModule],
    templateUrl: './purchase-orders.component.html',
    styleUrls: ['./purchase-orders.component.css']
})
export class PurchaseOrdersComponent {
    // Mock Data for "List of Purchasing Orders"
    orders = [
        { id: 'S-2339', department: 'Information Technology', date: '12 Jan 2026' },
        { id: 'S-7839', department: 'Astronomy', date: '12 Jan 2026' }
    ];

    // Mock Data for "Purchasing Order Requests"
    requests = [
        { id: 1, name: 'Alison paul', department: 'Information Technology', time: '1 day ago' },
        { id: 2, name: 'Amarabandu Roopasinghe', department: 'HR', time: '2 day ago' },
        { id: 3, name: 'Thiranjaya Siriwardhana', department: 'Admin', time: '12 . 12 . 2025' }
    ];

    // Mock Data for "Asset Request" Details (Currently selected)
    selectedRequest = {
        employee: 'Amarabandu Roopasinghe',
        division: 'Procurement', // UI shows Procurement despite HR in list, following UI screenshot exactly or logic? 
        // Screenshot shows "Division: Procurement" for Amarabandu.
        date: '12 Jan 2026',
        specs: {
            ram: '12GB',
            storage: '1TB',
            processor: 'Intel 14th gen i7'
        },
        note: 'I am a new Employee. So, I need a laptop'
    };
}
