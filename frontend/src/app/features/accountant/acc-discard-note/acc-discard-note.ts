import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccDiscardNotesService, AccDiscardNote } from '../../../services/acc-discard-notes.service';

@Component({
    selector: 'app-acc-discard-note',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './acc-discard-note.html',
    styleUrls: ['./acc-discard-note.css']
})
export class AccDiscardNoteComponent implements OnInit {
    notes: AccDiscardNote[] = [];
    selectedNote: AccDiscardNote | null = null;
    isLoading = true;

    constructor(
        private accDiscardNotesService: AccDiscardNotesService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.accDiscardNotesService.getAll().subscribe({
            next: (data) => {
                this.notes = data;
                this.isLoading = false;
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error('Failed to load discard notes:', err);
                this.isLoading = false;
                this.cdr.markForCheck();
            }
        });
    }

    viewNote(note: AccDiscardNote) {
        this.selectedNote = note;
    }

    closeNote() {
        this.selectedNote = null;
    }

    getStatusClass(status: string): string {
        return status.toLowerCase();
    }
}
