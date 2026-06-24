import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProcurementService } from '../../services/procurement.service';
import { CreateRepairingFirmRequest } from '../../models/maintenance.model';
import { StatusCardComponent } from '../../../../shared/components/status-card/status-card';

@Component({
    selector: 'app-repairing-firm-create',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, StatusCardComponent],
    templateUrl: './repairing-firm-create.component.html',
    styleUrls: ['./repairing-firm-create.component.css']
})
export class RepairingFirmCreateComponent implements OnInit {
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private procurementService = inject(ProcurementService);
    private fb = inject(FormBuilder);

    showSuccessPopup = false;
    isSaving = false;
    firmForm!: FormGroup;
    isEdit = false;
    firmId: number | null = null;

    ngOnInit(): void {
        this.firmForm = this.fb.group({
            name: ['', Validators.required],
            contactPerson: [''],
            phone: ['', [Validators.pattern('^[0-9]{10}$')]],
            email: ['', [Validators.email]],
            address: ['']
        });

        const idParam = this.route.snapshot.paramMap.get('id');
        if (idParam) {
            this.isEdit = true;
            this.firmId = Number(idParam);
            this.loadFirmData(this.firmId);
        }
    }

    loadFirmData(id: number): void {
        this.procurementService.getRepairingFirmById(id).subscribe({
            next: (data) => {
                this.firmForm.patchValue({
                    name: data.name,
                    contactPerson: data.contactPerson || '',
                    phone: data.phone || '',
                    email: data.email || '',
                    address: data.address || ''
                });
            },
            error: (err) => {
                console.error('Error loading repairing firm details', err);
                alert('Failed to load repairing firm details.');
                this.close();
            }
        });
    }

    get f() {
        return this.firmForm.controls;
    }

    save(): void {
        if (this.firmForm.invalid) {
            this.firmForm.markAllAsTouched();
            return;
        }

        this.isSaving = true;
        const formValue = this.firmForm.getRawValue();

        const requestData = {
            id: this.isEdit ? this.firmId : undefined,
            name: formValue.name,
            contactPerson: formValue.contactPerson || undefined,
            phone: formValue.phone || undefined,
            email: formValue.email || undefined,
            address: formValue.address || undefined
        };

        if (this.isEdit && this.firmId !== null) {
            this.procurementService.updateRepairingFirm(this.firmId, requestData).subscribe({
                next: () => {
                    this.showSuccessPopup = true;
                    this.isSaving = false;
                    setTimeout(() => {
                        this.showSuccessPopup = false;
                        this.router.navigate(['/procurement/maintenance/repairing-firms']);
                    }, 1500);
                },
                error: (err) => {
                    console.error('Error updating repairing firm', err);
                    this.isSaving = false;
                    alert('Error updating firm. Please check logs.');
                }
            });
        } else {
            this.procurementService.createRepairingFirm(requestData).subscribe({
                next: (id) => {
                    this.showSuccessPopup = true;
                    this.isSaving = false;
                    setTimeout(() => {
                        this.showSuccessPopup = false;
                        this.router.navigate(['/procurement/maintenance/repairing-firms']);
                    }, 1500);
                },
                error: (err) => {
                    console.error('Error saving repairing firm', err);
                    this.isSaving = false;
                    alert('Error saving firm. Please check logs.');
                }
            });
        }
    }

    close(): void {
        this.router.navigate(['/procurement/maintenance/repairing-firms']);
    }
}
