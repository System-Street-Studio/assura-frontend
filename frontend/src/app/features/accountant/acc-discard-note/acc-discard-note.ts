import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface DiscardNote {
    id: string;
    assetName: string;
    division: string;
    date: string;
    note: string;
    status: string;
    assetType: string;
    currentUser: string;
    time: string;
    valueAtPurchasing: string;
    currentValue: string;
}

@Component({
    selector: 'app-acc-discard-note',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './acc-discard-note.html',
    styleUrls: ['./acc-discard-note.css']
})
export class AccDiscardNoteComponent {
    notes: DiscardNote[] = [
        { id: '1', assetName: 'Dell XPS 15 Laptop', division: 'Information Technology', date: '20 Feb 2026', note: 'Performance of this laptop is not enough', status: 'Approved', assetType: 'Computer', currentUser: 'Allison Paul', time: '13:42', valueAtPurchasing: '150,000', currentValue: '50,000' },
        { id: '2', assetName: 'MacBook Air', division: 'Information Technology', date: '13 Dec 2025', note: 'Hardware failure — keyboard and trackpad unresponsive', status: 'Approved', assetType: 'Computer', currentUser: 'John Perera', time: '10:30', valueAtPurchasing: '180,000', currentValue: '45,000' },
        { id: '3', assetName: 'HP LaserJet Printer', division: 'Admin', date: '18 Feb 2026', note: 'Paper jam mechanism broken beyond repair', status: 'Pending', assetType: 'Printer', currentUser: 'Sarah Chen', time: '11:20', valueAtPurchasing: '45,000', currentValue: '20,000' },
        { id: '4', assetName: 'Cisco Router 2901', division: 'Information Technology', date: '12 Feb 2026', note: 'Outdated firmware, no longer supported by vendor', status: 'Approved', assetType: 'Network Equipment', currentUser: 'Kevin Park', time: '14:30', valueAtPurchasing: '120,000', currentValue: '15,000' },
        { id: '5', assetName: 'Samsung Monitor 27"', division: 'Design', date: '10 Feb 2026', note: 'Dead pixels across the display panel', status: 'Pending', assetType: 'Monitor', currentUser: 'Emily Davis', time: '10:00', valueAtPurchasing: '65,000', currentValue: '18,000' },
        { id: '6', assetName: 'Lenovo ThinkPad X1', division: 'Finance', date: '08 Feb 2026', note: 'Battery swelling, safety hazard', status: 'Approved', assetType: 'Computer', currentUser: 'Anna Martinez', time: '16:45', valueAtPurchasing: '180,000', currentValue: '60,000' },
        { id: '7', assetName: 'Canon Scanner DR-C225', division: 'Admin', date: '05 Feb 2026', note: 'Scanner motor failure, repair cost exceeds value', status: 'Pending', assetType: 'Scanner', currentUser: 'David Kim', time: '08:30', valueAtPurchasing: '35,000', currentValue: '5,000' },
        { id: '8', assetName: 'APC UPS 1500VA', division: 'Information Technology', date: '02 Feb 2026', note: 'Battery no longer holds charge', status: 'Approved', assetType: 'Power Supply', currentUser: 'James Wilson', time: '15:10', valueAtPurchasing: '55,000', currentValue: '8,000' },
        { id: '9', assetName: 'Epson Projector EB-X41', division: 'Marketing', date: '28 Jan 2026', note: 'Lamp burnt out, replacement not available', status: 'Approved', assetType: 'Projector', currentUser: 'Lisa Taylor', time: '11:00', valueAtPurchasing: '95,000', currentValue: '12,000' },
        { id: '10', assetName: 'Microsoft Surface Pro', division: 'HR', date: '25 Jan 2026', note: 'Cracked screen and faulty charging port', status: 'Pending', assetType: 'Tablet', currentUser: 'Jennifer White', time: '09:45', valueAtPurchasing: '110,000', currentValue: '25,000' },
        { id: '11', assetName: 'Logitech Webcam C920', division: 'IT Support', date: '20 Jan 2026', note: 'Autofocus broken, blurry image output', status: 'Approved', assetType: 'Peripheral', currentUser: 'Alex Johnson', time: '14:20', valueAtPurchasing: '8,000', currentValue: '3,000' },
        { id: '12', assetName: 'Brother Printer MFC', division: 'Admin', date: '15 Jan 2026', note: 'Print head clogged permanently', status: 'Pending', assetType: 'Printer', currentUser: 'Maria Garcia', time: '10:30', valueAtPurchasing: '42,000', currentValue: '7,000' }
    ];

    selectedNote: DiscardNote | null = null;

    viewNote(note: DiscardNote) {
        this.selectedNote = note;
    }

    closeNote() {
        this.selectedNote = null;
    }

    getStatusClass(status: string): string {
        return status.toLowerCase();
    }
}
