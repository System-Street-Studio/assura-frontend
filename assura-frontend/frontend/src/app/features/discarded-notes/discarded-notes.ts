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
            date: '10 Jan 2026',
            status: 'In Progress',
            time: '09:15',
            assetType: 'Printer',
            specialNote: 'Old model, needs replacement'
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
