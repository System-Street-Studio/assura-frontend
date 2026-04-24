import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface PendingItem {
    id: string;
    name: string;
    division: string;
    date: string;
    status: string;
    category: string;
    time: string;
    assetType: string;
    currentUser: string;
    specialNote: string;
    valueAtPurchasing: string;
    currentValue: string;
    isHighlighted?: boolean;
}

@Component({
    selector: 'app-acc-overview',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './acc-overview.html',
    styleUrls: ['./acc-overview.css']
})
export class AccOverviewComponent implements OnInit {
    approvedCount = 4;
    toBeApprovedCount = 5;
    pendingCount = 7;
    rejectCount = 2;

    activeFilter = 'all';

    allItems: PendingItem[] = [
        {
            id: '1', name: 'Dell XPS 15 Laptop', division: 'Information Technology',
            date: '1 day ago', status: 'Pending (Waiting for Confirmation)', category: 'pending',
            time: '13:42', assetType: 'Computer', currentUser: 'Allison Paul',
            specialNote: 'Performance of this laptop is not enough',
            valueAtPurchasing: '150,000', currentValue: '50,000', isHighlighted: false
        },
        {
            id: '2', name: 'Intel NUC', division: 'HR',
            date: '2 day ago', status: 'Approved', category: 'approved',
            time: '13:42', assetType: 'Computer', currentUser: 'Allison Paul',
            specialNote: '',
            valueAtPurchasing: '80,000', currentValue: '30,000', isHighlighted: true
        },
        {
            id: '3', name: 'MacBook Pro', division: 'Admin',
            date: '12 . 12 . 2025', status: 'Pending (Waiting for Confirmation)', category: 'pending',
            time: '09:15', assetType: 'Computer', currentUser: 'Mark Johnson',
            specialNote: '',
            valueAtPurchasing: '200,000', currentValue: '90,000', isHighlighted: false
        },
        {
            id: '4', name: 'HP LaserJet Printer', division: 'Admin',
            date: '3 day ago', status: 'Rejected', category: 'reject',
            time: '11:20', assetType: 'Printer', currentUser: 'Sarah Chen',
            specialNote: 'Printer still functional after maintenance',
            valueAtPurchasing: '45,000', currentValue: '20,000', isHighlighted: false
        },
        {
            id: '5', name: 'Cisco Router 2901', division: 'Information Technology',
            date: '5 day ago', status: 'To be Approved', category: 'to-be-approved',
            time: '14:30', assetType: 'Network Equipment', currentUser: 'Kevin Park',
            specialNote: 'Outdated firmware, no longer supported',
            valueAtPurchasing: '120,000', currentValue: '15,000', isHighlighted: false
        },
        {
            id: '6', name: 'Samsung Monitor 27"', division: 'Design',
            date: '1 week ago', status: 'Approved', category: 'approved',
            time: '10:00', assetType: 'Monitor', currentUser: 'Emily Davis',
            specialNote: 'Dead pixels across display',
            valueAtPurchasing: '65,000', currentValue: '18,000', isHighlighted: false
        },
        {
            id: '7', name: 'Lenovo ThinkPad X1', division: 'Finance',
            date: '4 day ago', status: 'To be Approved', category: 'to-be-approved',
            time: '16:45', assetType: 'Computer', currentUser: 'Anna Martinez',
            specialNote: 'Battery swelling, safety hazard',
            valueAtPurchasing: '180,000', currentValue: '60,000', isHighlighted: false
        },
        {
            id: '8', name: 'Canon Scanner DR-C225', division: 'Admin',
            date: '6 day ago', status: 'Pending (Waiting for Confirmation)', category: 'pending',
            time: '08:30', assetType: 'Scanner', currentUser: 'David Kim',
            specialNote: 'Scanner motor failure',
            valueAtPurchasing: '35,000', currentValue: '5,000', isHighlighted: false
        },
        {
            id: '9', name: 'APC UPS 1500VA', division: 'Information Technology',
            date: '1 week ago', status: 'Pending (Waiting for Confirmation)', category: 'pending',
            time: '15:10', assetType: 'Power Supply', currentUser: 'James Wilson',
            specialNote: 'Battery no longer holds charge',
            valueAtPurchasing: '55,000', currentValue: '8,000', isHighlighted: false
        },
        {
            id: '10', name: 'Epson Projector EB-X41', division: 'Marketing',
            date: '8 day ago', status: 'To be Approved', category: 'to-be-approved',
            time: '11:00', assetType: 'Projector', currentUser: 'Lisa Taylor',
            specialNote: 'Lamp burnt out, replacement not available',
            valueAtPurchasing: '95,000', currentValue: '12,000', isHighlighted: false
        },
        {
            id: '11', name: 'Microsoft Surface Pro', division: 'HR',
            date: '9 day ago', status: 'Approved', category: 'approved',
            time: '09:45', assetType: 'Tablet', currentUser: 'Jennifer White',
            specialNote: 'Cracked screen and faulty charging port',
            valueAtPurchasing: '110,000', currentValue: '25,000', isHighlighted: false
        },
        {
            id: '12', name: 'Logitech Webcam C920', division: 'IT Support',
            date: '10 day ago', status: 'Rejected', category: 'reject',
            time: '14:20', assetType: 'Peripheral', currentUser: 'Alex Johnson',
            specialNote: 'Webcam still usable for basic calls',
            valueAtPurchasing: '8,000', currentValue: '3,000', isHighlighted: false
        },
        {
            id: '13', name: 'Brother Printer MFC', division: 'Admin',
            date: '11 day ago', status: 'Pending (Waiting for Confirmation)', category: 'pending',
            time: '10:30', assetType: 'Printer', currentUser: 'Maria Garcia',
            specialNote: 'Print head clogged permanently',
            valueAtPurchasing: '42,000', currentValue: '7,000', isHighlighted: false
        },
        {
            id: '14', name: 'Dell Docking Station WD19', division: 'Information Technology',
            date: '2 week ago', status: 'To be Approved', category: 'to-be-approved',
            time: '12:15', assetType: 'Docking Station', currentUser: 'Robert Lee',
            specialNote: 'USB-C port damaged, intermittent connectivity',
            valueAtPurchasing: '28,000', currentValue: '6,000', isHighlighted: false
        },
        {
            id: '15', name: 'Sony WH-1000XM5', division: 'Marketing',
            date: '12 day ago', status: 'Approved', category: 'approved',
            time: '16:00', assetType: 'Headphones', currentUser: 'Michael Brown',
            specialNote: 'Left ear cup speaker blown',
            valueAtPurchasing: '25,000', currentValue: '5,000', isHighlighted: false
        },
        {
            id: '16', name: 'Wacom Intuos Pro Tablet', division: 'Design',
            date: '13 day ago', status: 'Pending (Waiting for Confirmation)', category: 'pending',
            time: '11:45', assetType: 'Graphics Tablet', currentUser: 'Sarah Chen',
            specialNote: 'Pressure sensitivity no longer working',
            valueAtPurchasing: '40,000', currentValue: '10,000', isHighlighted: false
        },
        {
            id: '17', name: 'TP-Link WiFi Adapter', division: 'IT Support',
            date: '2 week ago', status: 'To be Approved', category: 'to-be-approved',
            time: '08:00', assetType: 'Network Adapter', currentUser: 'Kevin Park',
            specialNote: 'Frequent disconnections, driver issues',
            valueAtPurchasing: '5,000', currentValue: '1,000', isHighlighted: false
        },
        {
            id: '18', name: 'Jabra Evolve2 Headset', division: 'HR',
            date: '15 day ago', status: 'Pending (Waiting for Confirmation)', category: 'pending',
            time: '13:00', assetType: 'Headset', currentUser: 'Anna Martinez',
            specialNote: 'Microphone crackling during calls',
            valueAtPurchasing: '18,000', currentValue: '4,000', isHighlighted: false
        }
    ];

    filteredItems: PendingItem[] = [];
    selectedItem: PendingItem | null = null;
    currentPage = 1;
    totalPages = 3;
    showConfirmModal = false;
    showSuccessCard = false;

    ngOnInit() {
        this.filteredItems = [...this.allItems];
        if (this.filteredItems.length > 0) {
            this.selectedItem = this.filteredItems[0];
        }
    }

    filterByCategory(category: string) {
        this.activeFilter = category;
        if (category === 'all') {
            this.filteredItems = [...this.allItems];
        } else {
            this.filteredItems = this.allItems.filter(item => item.category === category);
        }
        this.selectedItem = this.filteredItems.length > 0 ? this.filteredItems[0] : null;
        this.currentPage = 1;
    }

    selectItem(item: PendingItem) {
        this.selectedItem = item;
    }

    confirmDiscarding() {
        if (!this.selectedItem) return;
        this.showConfirmModal = true;
    }

    closeConfirmModal() {
        this.showConfirmModal = false;
    }

    saveAsDiscarded() {
        if (!this.selectedItem) return;
        this.allItems = this.allItems.filter(item => item.id !== this.selectedItem!.id);
        this.filterByCategory(this.activeFilter);
        this.showConfirmModal = false;
        this.showSuccessCard = true;
        setTimeout(() => {
            this.showSuccessCard = false;
        }, 3000);
    }

    closeSuccess() {
        this.showSuccessCard = false;
    }

    goToPage(page: number) {
        this.currentPage = page;
    }

    previousPage() {
        if (this.currentPage > 1) this.currentPage--;
    }

    nextPage() {
        if (this.currentPage < this.totalPages) this.currentPage++;
    }
}
