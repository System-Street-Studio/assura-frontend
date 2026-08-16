import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ProcurementService } from '../../services/procurement.service';
import { AssetSummaryDto, RepairingFirmDto, CreateMaintenanceRequest } from '../../models/maintenance.model';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
    selector: 'app-maintenance-note-create',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule],
    templateUrl: './maintenance-note-create.component.html',
    styleUrls: ['./maintenance-note-create.component.css']
})
export class MaintenanceNoteCreateComponent implements OnInit {

    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private procurementService = inject(ProcurementService);
    private toastService = inject(ToastService);
    assets: AssetSummaryDto[] = [];
    repairingFirms: RepairingFirmDto[] = [];
    selectedAsset: AssetSummaryDto | null = null;
    requestId: number | null = null;

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
            cost: [0, [Validators.required, Validators.min(0)]],
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

    preventNegative(event: KeyboardEvent): void {
        if (event.key === '-' || event.key === 'e' || event.key === 'E' || event.key === '+') {
            event.preventDefault();
        }
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
            const requestId = params['requestId'];

            this.requestId = requestId ? Number(requestId) : null;

            let foundAssetId: number | null = null;

            if (assetId) {
                foundAssetId = Number(assetId);
            }

            // Fallback: If assetId is not found, try to match by assetCode or name in the description/params
            if (!foundAssetId && description) {
                const descLower = description.toLowerCase();
                // Try to find an asset where assetCode is contained in the description (case-insensitive)
                const matchedByCode = this.assets.find(a => 
                    a.assetCode && descLower.includes(a.assetCode.toLowerCase())
                );
                if (matchedByCode) {
                    foundAssetId = matchedByCode.id;
                } else {
                    // Try to find by productName or assetName contained in the description
                    const matchedByName = this.assets.find(a => 
                        (a.assetName && descLower.includes(a.assetName.toLowerCase())) ||
                        (a.productName && descLower.includes(a.productName.toLowerCase()))
                    );
                    if (matchedByName) {
                        foundAssetId = matchedByName.id;
                    }
                }
            }

            if (foundAssetId) {
                this.noteForm.patchValue({ assetId: foundAssetId });
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
            repairingFirmId: formValue.repairingFirmId || undefined,
            requestId: this.requestId || undefined
        };

        console.log('Saving note:', request);
        this.procurementService.createMaintenance(request).subscribe({
            next: (id) => {
                this.toastService.show('Added New Maintenance Note Successfully', 'success');
                this.router.navigate(['/procurement/maintenance']);
            },
            error: (err) => {
                console.error('Error saving maintenance note', err);
                this.toastService.show('Error saving maintenance note. Please check logs.', 'error');
            }
        });
    }

    close(): void {
        this.router.navigate(['/procurement/maintenance']);
    }
}
