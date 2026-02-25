import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiscardedNote } from './models/discarded-note.model';

@Component({
    selector: 'app-discarded-notes',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './discarded-notes.html',
    styleUrls: ['./discarded-notes.css']
})
export class DiscardedNotesComponent implements OnInit {
    notes: DiscardedNote[] = [
        {
            id: '1',
            name: 'Alison Paul',
            division: 'Astronomy',
            date: '10 Jan 2026',
            status: 'Pending',
            time: '13:42',
            assetType: 'Computer',
            specialNote: 'Performance of this laptop is not enough'
        },
        {
            id: '2',
            name: 'Amarabandu Roopasinghe',
            division: 'Information Technology',
            date: '12 Jan 2026',
            status: 'In Progress',
            time: '09:15',
            assetType: 'Printer',
            specialNote: 'Old model, needs replacement'
        },
        {
            id: '3',
            name: 'Sarah Jenkins',
            division: 'Human Resources',
            date: '14 Jan 2026',
            status: 'Completed',
            time: '11:20',
            assetType: 'Laptop',
            specialNote: 'Screen flickering issue'
        },
        {
            id: '4',
            name: 'Michael Chen',
            division: 'Engineering',
            date: '15 Jan 2026',
            status: 'Pending',
            time: '16:05',
            assetType: 'Mobile Device',
            specialNote: 'Battery health degraded'
        },
        {
            id: '5',
            name: 'Emma Watson',
            division: 'Finance',
            date: '18 Jan 2026',
            status: 'In Progress',
            time: '10:30',
            assetType: 'Desktop',
            specialNote: 'HDD noise, possibly failing'
        },
        {
            id: '6',
            name: 'James Bond',
            division: 'Security',
            date: '20 Jan 2026',
            status: 'Rejected',
            time: '08:45',
            assetType: 'Access Point',
            specialNote: 'Hardware upgrade required'
        },
        {
            id: '7',
            name: 'Linda Belcher',
            division: 'Administration',
            date: '22 Jan 2026',
            status: 'Pending',
            time: '14:50',
            assetType: 'Scanner',
            specialNote: 'Network connectivity issues'
        },
        {
            id: '8',
            name: 'Robert Stark',
            division: 'Logistics',
            date: '25 Jan 2026',
            status: 'Completed',
            time: '15:15',
            assetType: 'Tablet',
            specialNote: 'Broken charging port'
        }
    ];

    filteredNotes: DiscardedNote[] = [];
    searchQuery: string = '';
    selectedNote: DiscardedNote | null = null;
    showFilter: boolean = false;

    ngOnInit() {
        this.filteredNotes = [...this.notes];
    }

    onSearch() {
        this.filteredNotes = this.notes.filter(note =>
            note.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            note.division.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
    }

    selectNote(note: DiscardedNote) {
        this.selectedNote = note;
    }

    closeDetail() {
        this.selectedNote = null;
    }

    toggleFilter() {
        this.showFilter = !this.showFilter;
    }
}
