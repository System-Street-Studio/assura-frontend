import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface LoseItem {
    id: string;
    assetName: string;
    division: string;
    date: string;
    reportedBy: string;
    status: string;
    assetType: string;
    time: string;
    valueAtPurchasing: string;
    currentValue: string;
    description: string;
}

@Component({
    selector: 'app-acc-lose',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './acc-lose.html',
    styleUrls: ['./acc-lose.css']
})
export class AccLoseComponent {
    loseItems: LoseItem[] = [
        { id: '1', assetName: 'Logitech MX Master 3S', division: 'IT Support', date: '22 Feb 2026', reportedBy: 'James Wilson', status: 'Reported', assetType: 'Mouse', time: '09:30', valueAtPurchasing: '12,000', currentValue: '8,000', description: 'Last seen on desk in IT room B3, not found after office cleaning' },
        { id: '2', assetName: 'Samsung Galaxy Tab S9', division: 'Marketing', date: '19 Feb 2026', reportedBy: 'Emily Davis', status: 'Under Investigation', assetType: 'Tablet', time: '14:15', valueAtPurchasing: '85,000', currentValue: '60,000', description: 'Missing from marketing presentation room after client meeting' },
        { id: '3', assetName: 'Canon EOS R5', division: 'Media', date: '14 Feb 2026', reportedBy: 'Robert Lee', status: 'Confirmed Lost', assetType: 'Camera', time: '11:00', valueAtPurchasing: '350,000', currentValue: '280,000', description: 'Lost during outdoor photoshoot event, all areas searched' },
        { id: '4', assetName: 'Apple iPad Pro 12.9"', division: 'Design', date: '10 Feb 2026', reportedBy: 'Sarah Chen', status: 'Reported', assetType: 'Tablet', time: '16:00', valueAtPurchasing: '120,000', currentValue: '90,000', description: 'Left in conference room 4A, missing when retrieved' },
        { id: '5', assetName: 'Sony WH-1000XM5', division: 'HR', date: '08 Feb 2026', reportedBy: 'Michael Brown', status: 'Under Investigation', assetType: 'Headphones', time: '10:45', valueAtPurchasing: '25,000', currentValue: '18,000', description: 'Not found in employee locker after lunch break' },
        { id: '6', assetName: 'Seagate External HDD 2TB', division: 'Finance', date: '05 Feb 2026', reportedBy: 'Anna Martinez', status: 'Confirmed Lost', assetType: 'Storage Device', time: '13:20', valueAtPurchasing: '15,000', currentValue: '10,000', description: 'Contains backup data, lost during office relocation' },
        { id: '7', assetName: 'Dell Docking Station WD19', division: 'Information Technology', date: '02 Feb 2026', reportedBy: 'Kevin Park', status: 'Reported', assetType: 'Docking Station', time: '08:00', valueAtPurchasing: '28,000', currentValue: '15,000', description: 'Missing from server room desk after weekend maintenance' },
        { id: '8', assetName: 'Bose SoundLink Speaker', division: 'Marketing', date: '28 Jan 2026', reportedBy: 'Lisa Taylor', status: 'Confirmed Lost', assetType: 'Speaker', time: '15:30', valueAtPurchasing: '20,000', currentValue: '12,000', description: 'Used at company event, not returned to storage' },
        { id: '9', assetName: 'Kingston USB Drive 128GB', division: 'Admin', date: '25 Jan 2026', reportedBy: 'David Kim', status: 'Reported', assetType: 'Storage Device', time: '12:00', valueAtPurchasing: '3,000', currentValue: '2,000', description: 'Missing from admin desk drawer, may have been misplaced' },
        { id: '10', assetName: 'Wacom Intuos Pro Tablet', division: 'Design', date: '20 Jan 2026', reportedBy: 'Jennifer White', status: 'Under Investigation', assetType: 'Graphics Tablet', time: '17:00', valueAtPurchasing: '40,000', currentValue: '28,000', description: 'Shared between designers, last seen in studio room' },
        { id: '11', assetName: 'TP-Link WiFi Adapter', division: 'IT Support', date: '15 Jan 2026', reportedBy: 'Alex Johnson', status: 'Confirmed Lost', assetType: 'Network Adapter', time: '09:00', valueAtPurchasing: '5,000', currentValue: '2,000', description: 'Small device, likely misplaced during hardware audit' },
        { id: '12', assetName: 'Jabra Evolve2 Headset', division: 'HR', date: '10 Jan 2026', reportedBy: 'Maria Garcia', status: 'Reported', assetType: 'Headset', time: '14:00', valueAtPurchasing: '18,000', currentValue: '12,000', description: 'Left in meeting room, not found by security' }
    ];

    selectedItem: LoseItem | null = null;

    selectItem(item: LoseItem) {
        this.selectedItem = item;
    }

    closeDetail() {
        this.selectedItem = null;
    }

    getStatusClass(status: string): string {
        if (status === 'Reported') return 'reported';
        if (status === 'Under Investigation') return 'investigating';
        if (status === 'Confirmed Lost') return 'confirmed';
        return '';
    }
}
