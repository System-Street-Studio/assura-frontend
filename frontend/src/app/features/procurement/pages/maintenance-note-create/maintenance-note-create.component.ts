import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StatusCardComponent } from '../../../../shared/components/status-card/status-card';

@Component({
    selector: 'app-maintenance-note-create',
    standalone: true,
    imports: [CommonModule, FormsModule, StatusCardComponent],
    templateUrl: './maintenance-note-create.component.html',
    styleUrls: ['./maintenance-note-create.component.css']
})
export class MaintenanceNoteCreateComponent {
    private router = inject(Router);

    showSuccessPopup = false;

    noteData = {
        asset: '',
        date: '',
        repairFirm: '',
        cost: '',
        description: ''
    };

    save(): void {
        console.log('Saving note:', this.noteData);
        this.showSuccessPopup = true;

        setTimeout(() => {
            this.showSuccessPopup = false;
            this.router.navigate(['/procurement/maintenance']);
        }, 800);
    }

    close(): void {
        this.router.navigate(['/procurement/maintenance']);
    }
}
