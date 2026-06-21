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
    showFilter: boolean = false;
    isLoading = true;

    constructor(
        private discardedNotesService: DiscardedNotesService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.discardedNotesService.getAll().subscribe({
            next: (data) => {
                this.notes = data;
                this.filteredNotes = [...this.notes];
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
