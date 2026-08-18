import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiscardedNote } from './models/discarded-note.model';
import { DiscardedNotesService } from '../../services/discarded-notes.service';

@Component({
    selector: 'app-discarded-notes',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './discarded-notes.html',
    styleUrls: ['./discarded-notes.css']
})
export class DiscardedNotesComponent implements OnInit {
    notes: DiscardedNote[] = [];
    filteredNotes: DiscardedNote[] = [];
    searchQuery: string = '';
    selectedNote: DiscardedNote | null = null;
    isLoading = true;

    constructor(
        private discardedNotesService: DiscardedNotesService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.discardedNotesService.getAll().subscribe({
            next: (data) => {
                this.notes = data;
                this.applyFilters();
                this.isLoading = false;
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error('Failed to load discarded notes:', err);
                this.isLoading = false;
                this.cdr.markForCheck();
            }
        });
    }

    onSearch() {
        this.applyFilters();
    }

    private applyFilters() {
        const query = this.searchQuery.toLowerCase();
        this.filteredNotes = this.notes.filter(note => {
            const matchesSearch =
                (note.name ?? '').toLowerCase().includes(query) ||
                (note.division ?? '').toLowerCase().includes(query);
            return matchesSearch;
        });
    }

    selectNote(note: DiscardedNote) {
        this.selectedNote = note;
    }

    closeDetail() {
        this.selectedNote = null;
    }
}
