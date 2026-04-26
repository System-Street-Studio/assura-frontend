import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiscardedNote } from './models/discarded-note.model';
import { ApiService } from '../../core/services/api.service';

@Component({
    selector: 'app-discarded-notes',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './discarded-notes.html',
    styleUrls: ['./discarded-notes.css']
})
export class DiscardedNotesComponent implements OnInit {
    api = inject(ApiService);
    notes: DiscardedNote[] = [];

    filteredNotes: DiscardedNote[] = [];
    searchQuery = '';
    selectedNote: DiscardedNote | null = null;
    showFilter = false;

    ngOnInit() {
        this.api.get<DiscardedNote[]>('DiscardedNotes').subscribe({
            next: (data) => {
                this.notes = data;
                this.filteredNotes = [...this.notes];
            },
            error: (err) => console.error(err)
        });
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
