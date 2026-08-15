import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiscardedNote } from './models/discarded-note.model';
import { DiscardedNotesService } from '../../services/discarded-notes.service';

const REVIEWABLE_STATUSES = ['Completed', 'Rejected'];

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
    statusFilter = '';
    readonly statusOptions = ['Pending', 'In Progress', 'Completed', 'Rejected'];
    isLoading = true;

    // Review flow state
    reviewStep: 'idle' | 'choose' | 'notes' = 'idle';
    reviewAction: 'done' | 'reject' | '' = '';
    reviewNote = '';
    showSuccessCard = false;
    showRejectCard = false;

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
            const matchesStatus = !this.statusFilter || note.status === this.statusFilter;
            return matchesSearch && matchesStatus;
        });
    }

    toggleFilter() {
        this.showFilter = !this.showFilter;
    }

    filterByStatus(status: string) {
        this.statusFilter = this.statusFilter === status ? '' : status;
        this.applyFilters();
    }

    clearStatusFilter() {
        this.statusFilter = '';
        this.applyFilters();
    }

    selectNote(note: DiscardedNote) {
        this.selectedNote = note;
        this.resetReview();
    }

    closeDetail() {
        this.selectedNote = null;
        this.resetReview();
    }

    isReviewable(note: DiscardedNote): boolean {
        return !REVIEWABLE_STATUSES.includes(note.status);
    }

    startReview() {
        this.reviewStep = 'choose';
    }

    chooseAction(action: 'done' | 'reject') {
        this.reviewAction = action;
        this.reviewStep = 'notes';
        this.reviewNote = '';
    }

    cancelReview() {
        this.resetReview();
    }

    submitReview() {
        if (!this.selectedNote) return;

        const action = this.reviewAction;
        const newStatus = action === 'done' ? 'Completed' : 'Rejected';

        this.discardedNotesService.updateStatus(this.selectedNote.id, newStatus, this.reviewNote).subscribe({
            next: () => {
                if (this.selectedNote) {
                    this.selectedNote.status = newStatus;
                    if (this.reviewNote) {
                        this.selectedNote.specialNote = this.reviewNote;
                    }
                }
                this.applyFilters();
                this.resetReview();

                if (action === 'done') {
                    this.showSuccessCard = true;
                    setTimeout(() => { this.showSuccessCard = false; this.cdr.markForCheck(); }, 3000);
                } else {
                    this.showRejectCard = true;
                    setTimeout(() => { this.showRejectCard = false; this.cdr.markForCheck(); }, 3000);
                }
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error('Failed to update discarded note status:', err);
                this.cdr.markForCheck();
            }
        });
    }

    private resetReview() {
        this.reviewStep = 'idle';
        this.reviewAction = '';
        this.reviewNote = '';
    }
}
