import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';

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
export class AccDiscardNoteComponent implements OnInit {
    api = inject(ApiService);
    notes: DiscardNote[] = [];
    selectedNote: DiscardNote | null = null;

    ngOnInit() {
        this.api.get<DiscardNote[]>('AccDiscardNotes').subscribe({
            next: (data) => this.notes = data,
            error: (err) => console.error(err)
        });
    }

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
