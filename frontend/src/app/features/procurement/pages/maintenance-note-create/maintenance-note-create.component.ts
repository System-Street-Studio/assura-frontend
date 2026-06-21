import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StatusCardComponent } from '../../../../shared/components/status-card/status-card';
import { ProcurementService } from '../../services/procurement.service';
import { AssetSummaryDto, RepairingFirmDto, CreateMaintenanceRequest } from '../../models/maintenance.model';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-maintenance-note-create',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, StatusCardComponent],
    templateUrl: './maintenance-note-create.component.html',
    styleUrls: ['./maintenance-note-create.component.css']
})
export class MaintenanceNoteCreateComponent implements OnInit {

    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private procurementService = inject(ProcurementService);



    showSuccessPopup = false;
    assets: AssetSummaryDto[] = [];
    repairingFirms: RepairingFirmDto[] = [];
    selectedAsset: AssetSummaryDto | null = null;

    noteData = {
        maintenanceNumber: '',
        assetId: null as number | null,
        date: '',
        repairingFirmId: null as number | null,
        cost: 0,
        description: '',
        status: 'Scheduled'
    };

    // validate form
    private fb = inject(FormBuilder);
    noteForm: FormGroup;
    constructor() {
        this.noteForm = this.fb.group({
            maintenanceNumber: [{ value: '', disabled: true }],
            assetId: [null, Validators.required],
            date: ['', Validators.required],
            repairingFirmId: [null],
            cost: [0, Validators.required],
            description: ['', Validators.required],
            status: ['Scheduled', Validators.required]
        })
    }



    ngOnInit(): void {
        this.loadInitialData();
        // Auto-generate a maintenance number
        const mtnNumber = 'MTN-' + Math.floor(1000 + Math.random() * 9000);
        this.noteData.maintenanceNumber = mtnNumber;
        this.noteForm.patchValue({ maintenanceNumber: mtnNumber });
    }

    loadInitialData(): void {
        this.procurementService.getAssets().subscribe(data => {
            this.assets = data;
            this.checkQueryParams();
        });
        this.procurementService.getRepairingFirms().subscribe(data => this.repairingFirms = data);
    }

    private checkQueryParams(): void {
        this.route.queryParams.subscribe(params => {
            const assetId = params['assetId'];
            const description = params['description'];
            const date = params['date'];

            if (assetId) {
                const id = Number(assetId);
                this.noteForm.patchValue({ assetId: id });
                this.onAssetChange();
            }
            if (description) {
                this.noteForm.patchValue({ description });
            }
            if (date) {
                this.noteForm.patchValue({ date });
            }
        });
    }

    onAssetChange(): void {
        const assetId = this.noteForm.get('assetId')?.value;
        if (assetId) {
            this.selectedAsset = this.assets.find(a => a.id === assetId) || null;
            console.log('Selected asset:', this.selectedAsset);
        } else {
            this.selectedAsset = null;
        }
    }

    // getters (for getting data easily)
    get f() {
        return this.noteForm.controls;
    }


    save(): void {
        if (this.noteForm.invalid) {
            this.noteForm.markAllAsTouched();
            return;
        }

        const formValue = this.noteForm.getRawValue();

        const request: CreateMaintenanceRequest = {
            maintenanceNumber: formValue.maintenanceNumber,
            type: 1, // Defaulting to Preventive for now, could add a dropdown
            maintenanceDate: formValue.date,
            description: formValue.description,
            cost: Number(formValue.cost),
            status: formValue.status,
            assetId: formValue.assetId!,
            repairingFirmId: formValue.repairingFirmId || undefined
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
