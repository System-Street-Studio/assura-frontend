import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StatusCardComponent } from '../../../../shared/components/status-card/status-card';
import { ProcurementService } from '../../services/procurement.service';
import { MaintenanceDto } from '../../models/maintenance.model';

@Component({
    selector: 'app-maintenance-note',
    standalone: true,
    imports: [CommonModule, FormsModule, StatusCardComponent],
    templateUrl: './maintenance-note.component.html',
    styleUrls: ['./maintenance-note.component.css']
})
export class MaintenanceNoteComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private procurementService = inject(ProcurementService);

    noteId: number | null = null;
    noteData: MaintenanceDto | null = null;
    isUpdating = false;
    showSuccessPopup = false;
    editStatus: string = '';

    ngOnInit(): void {
        const idParam = this.route.snapshot.paramMap.get('id');
        if (idParam) {
            this.noteId = Number(idParam);
            this.loadNoteData();
        }
    }

    loadNoteData(): void {
        if (this.noteId) {
            this.procurementService.getMaintenanceById(this.noteId).subscribe({
                next: (data) => {
                    this.noteData = data;
                    this.editStatus = data.status || 'Scheduled';
                },
                error: (err) => console.error('Error fetching maintenance note', err)
            });
        }
    }

    updateStatus(): void {
        if (!this.noteId || !this.editStatus) return;

        this.isUpdating = true;
        this.procurementService.updateMaintenanceStatus(this.noteId, this.editStatus).subscribe({
            next: () => {
                this.isUpdating = false;
                this.showSuccessPopup = true;
                if (this.noteData) this.noteData.status = this.editStatus;
                setTimeout(() => {
                    this.showSuccessPopup = false;
                }, 2000);
            },
            error: (err) => {
                this.isUpdating = false;
                console.error('Error updating maintenance status', err);
                alert('Failed to update status.');
            }
        });
    }

    close(): void {
        this.router.navigate(['/procurement/maintenance']);
    }
}
