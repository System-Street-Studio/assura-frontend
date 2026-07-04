import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ProcurementService } from '../../services/procurement.service';
import { MaintenanceDto } from '../../models/maintenance.model';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
    selector: 'app-maintenance-note',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './maintenance-note.component.html',
    styleUrls: ['./maintenance-note.component.css']
})
export class MaintenanceNoteComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private procurementService = inject(ProcurementService);
    private toastService = inject(ToastService);

    noteId: number | null = null;
    noteData: MaintenanceDto | null = null;
    isUpdating = false;
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
                this.toastService.show('Status Updated Successfully', 'success');
                if (this.noteData) this.noteData.status = this.editStatus;
            },
            error: (err) => {
                this.isUpdating = false;
                console.error('Error updating maintenance status', err);
                this.toastService.show('Failed to update status.', 'error');
            }
        });
    }

    close(): void {
        this.router.navigate(['/procurement/maintenance']);
    }
}
