import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-buyer',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './buyer.html',
    styleUrls: ['./buyer.css']
})
export class BuyerComponent {
    buyers = [
        { id: '1', name: 'TechWorld Distributors', contact: 'John Smith', email: 'john@techworld.com', phone: '+1 555-0101', category: 'Electronics', status: 'Active' },
        { id: '2', name: 'Office Solutions Inc.', contact: 'Sarah Davis', email: 'sarah@officesolutions.com', phone: '+1 555-0202', category: 'Office Supplies', status: 'Active' },
        { id: '3', name: 'NetGear Partners', contact: 'Mike Johnson', email: 'mike@netgear.com', phone: '+1 555-0303', category: 'Networking', status: 'Inactive' },
        { id: '4', name: 'ProDisplay Corp', contact: 'Emily Chen', email: 'emily@prodisplay.com', phone: '+1 555-0404', category: 'Monitors', status: 'Active' },
        { id: '5', name: 'CloudBase Systems', contact: 'David Wilson', email: 'david@cloudbase.com', phone: '+1 555-0505', category: 'Cloud Infrastructure', status: 'Active' },
        { id: '6', name: 'SecureIT Ltd.', contact: 'Anna Martinez', email: 'anna@secureit.com', phone: '+1 555-0606', category: 'Security', status: 'Pending' }
    ];

    selectedBuyer: any = null;

    selectBuyer(buyer: any) {
        this.selectedBuyer = buyer;
    }

    closeDetail() {
        this.selectedBuyer = null;
    }
}
