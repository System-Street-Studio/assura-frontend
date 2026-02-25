import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface DiscardedItem {
    name: string;
    division: string;
    date: string;
    assetType: string;
    currentUser: string;
    specialNote: string;
    valueAtPurchasing: string;
    currentValue: string;
    time: string;
}

@Component({
    selector: 'app-acc-discarded',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './acc-discarded.html',
    styleUrls: ['./acc-discarded.css']
})
export class AccDiscardedComponent {
    discardedItems: DiscardedItem[] = [
        { name: 'MacBook Air', division: 'Information technology', date: '13 Dec 2025', assetType: 'Computer', currentUser: 'John Perera', specialNote: 'Screen flickering issue', valueAtPurchasing: '180,000', currentValue: '45,000', time: '10:30' },
        { name: 'Dell XPS 15 Laptop', division: 'Information Technology', date: '12 Dec 2025', assetType: 'Computer', currentUser: 'Allison Paul', specialNote: 'Performance of this laptop is not enough', valueAtPurchasing: '150,000', currentValue: '50,000', time: '13:42' },
        { name: 'Intel NUC', division: 'HR', date: '10 Dec 2025', assetType: 'Computer', currentUser: 'Allison Paul', specialNote: 'Overheating frequently', valueAtPurchasing: '80,000', currentValue: '30,000', time: '13:42' },
        { name: 'HP LaserJet Printer', division: 'Admin', date: '08 Dec 2025', assetType: 'Printer', currentUser: 'Sarah Chen', specialNote: 'Print head damaged beyond repair', valueAtPurchasing: '45,000', currentValue: '20,000', time: '11:20' },
        { name: 'Cisco Router 2901', division: 'Information Technology', date: '05 Dec 2025', assetType: 'Network Equipment', currentUser: 'Kevin Park', specialNote: 'Outdated firmware, no longer supported', valueAtPurchasing: '120,000', currentValue: '15,000', time: '14:30' },
        { name: 'Samsung Monitor 27"', division: 'Design', date: '02 Dec 2025', assetType: 'Monitor', currentUser: 'Emily Davis', specialNote: 'Dead pixels across display', valueAtPurchasing: '65,000', currentValue: '18,000', time: '10:00' },
        { name: 'Lenovo ThinkPad X1', division: 'Finance', date: '28 Nov 2025', assetType: 'Computer', currentUser: 'Anna Martinez', specialNote: 'Battery swelling, safety hazard', valueAtPurchasing: '180,000', currentValue: '60,000', time: '16:45' },
        { name: 'Canon Scanner DR-C225', division: 'Admin', date: '25 Nov 2025', assetType: 'Scanner', currentUser: 'David Kim', specialNote: 'Scanner motor failure', valueAtPurchasing: '35,000', currentValue: '5,000', time: '08:30' },
        { name: 'Logitech Webcam C920', division: 'HR', date: '20 Nov 2025', assetType: 'Peripheral', currentUser: 'Alex Johnson', specialNote: 'Lens scratched, blurry output', valueAtPurchasing: '8,000', currentValue: '3,000', time: '14:20' },
        { name: 'Epson Projector EB-X41', division: 'Marketing', date: '18 Nov 2025', assetType: 'Projector', currentUser: 'Lisa Taylor', specialNote: 'Lamp burnt out, replacement not available', valueAtPurchasing: '95,000', currentValue: '12,000', time: '11:00' },
        { name: 'APC UPS 1500VA', division: 'Information Technology', date: '15 Nov 2025', assetType: 'Power Supply', currentUser: 'James Wilson', specialNote: 'Battery no longer holds charge', valueAtPurchasing: '55,000', currentValue: '8,000', time: '15:10' },
        { name: 'Microsoft Surface Pro', division: 'Design', date: '10 Nov 2025', assetType: 'Tablet', currentUser: 'Jennifer White', specialNote: 'Cracked screen and faulty charging port', valueAtPurchasing: '110,000', currentValue: '25,000', time: '09:45' }
    ];

    selectedItem: DiscardedItem | null = null;
    showSuccessCard = false;
    isDownloaded = false;

    selectItem(item: DiscardedItem) {
        this.selectedItem = this.selectedItem === item ? null : item;
    }

    downloadReceipt() {
        this.isDownloaded = true;
    }

    closeDetail() {
        this.selectedItem = null;
    }
}
