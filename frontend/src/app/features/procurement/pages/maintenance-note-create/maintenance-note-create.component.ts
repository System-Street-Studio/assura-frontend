import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StatusCardComponent } from '../../../../shared/components/status-card/status-card';
import { ProcurementService } from '../../services/procurement.service';
import { AssetSummaryDto, RepairingFirmDto, CreateMaintenanceRequest } from '../../models/maintenance.model';

@Component({
    selector: 'app-maintenance-note-create',
    standalone: true,
    imports: [CommonModule, FormsModule, StatusCardComponent],
    templateUrl: './maintenance-note-create.component.html',
    styleUrls: ['./maintenance-note-create.component.css']
})
export class MaintenanceNoteCreateComponent implements OnInit {
    private router = inject(Router);
    private procurementService = inject(ProcurementService);

    showSuccessPopup = false;
    assets: AssetSummaryDto[] = [];
    repairingFirms: RepairingFirmDto[] = [];

    noteData = {
        maintenanceNumber: '',
        assetId: null as number | null,
        date: '',
        repairingFirmId: null as number | null,
        cost: 0,
        description: '',
        status: 'Scheduled'
    };

    ngOnInit(): void {
        this.loadInitialData();
        // Auto-generate a maintenance number
        this.noteData.maintenanceNumber = 'MTN-' + Math.floor(1000 + Math.random() * 9000);
    }

    loadInitialData(): void {
        this.procurementService.getAssets().subscribe(data => this.assets = data);
        this.procurementService.getRepairingFirms().subscribe(data => this.repairingFirms = data);
    }

    save(): void {
        if (!this.noteData.assetId) {
            alert('Please select an asset');
            return;
        }

        const request: CreateMaintenanceRequest = {
            maintenanceNumber: this.noteData.maintenanceNumber,
            type: 1, // Defaulting to Preventive for now, could add a dropdown
            maintenanceDate: this.noteData.date,
            description: this.noteData.description,
            cost: Number(this.noteData.cost),
            status: this.noteData.status,
            assetId: this.noteData.assetId,
            repairingFirmId: this.noteData.repairingFirmId || undefined
        };

        console.log('Saving note:', request);
        this.procurementService.createMaintenance(request).subscribe({
            next: (id) => {
                this.showSuccessPopup = true;
                setTimeout(() => {
                    this.showSuccessPopup = false;
                    this.router.navigate(['/procurement/maintenance']);
                }, 1500);
            },
            error: (err) => {
                console.error('Error saving maintenance note', err);
                alert('Error saving maintenance note. Please check logs.');
            }
        });
    }

    close(): void {
        this.router.navigate(['/procurement/maintenance']);
    }
}
