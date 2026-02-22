import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-maintenance-note',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './maintenance-note.component.html',
    styleUrls: ['./maintenance-note.component.css']
})
export class MaintenanceNoteComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    noteId: string | null = null;

    // Mock data for the note
    noteData = {
        asset: 'Dell XPS 15',
        date: '12 Jan. 2026',
        repairFirm: 'Neat Solution (Pty)ltd.',
        cost: '2000',
        description: 'Replace the display'
    };

    ngOnInit(): void {
        this.noteId = this.route.snapshot.paramMap.get('id');
        // In a real app, we would fetch the data based on noteId
    }

    close(): void {
        this.router.navigate(['/procurement/maintenance']);
    }
}
