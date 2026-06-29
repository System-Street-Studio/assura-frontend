import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProcurementService } from '../../services/procurement.service';
import { CreateRepairingFirmRequest } from '../../models/maintenance.model';
import { StatusCardComponent } from '../../../../shared/components/status-card/status-card';
import { ToastService } from '../../../../shared/services/toast.service';

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
    private toastService = inject(ToastService);

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
                this.toastService.show('Failed to load repairing firm details.', 'error');
                this.close();
            }
        });
    }

    preventNonNumeric(event: KeyboardEvent): void {
        const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];
        if (allowedKeys.includes(event.key)) {
            return;
        }
        if (!/^[0-9]$/.test(event.key)) {
            event.preventDefault();
        }
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
                    this.toastService.show('Repairing firm updated successfully!', 'success');
                    this.isSaving = false;
                    this.router.navigate(['/procurement/maintenance/repairing-firms']);
                },
                error: (err) => {
                    console.error('Error updating repairing firm', err);
                    this.isSaving = false;
                    this.toastService.show('Error updating firm. Please check logs.', 'error');
                }
            });
        } else {
            this.procurementService.createRepairingFirm(requestData).subscribe({
                next: (id) => {
                    this.toastService.show('Repairing firm added successfully!', 'success');
                    this.isSaving = false;
                    this.router.navigate(['/procurement/maintenance/repairing-firms']);
                },
                error: (err) => {
                    console.error('Error saving repairing firm', err);
                    this.isSaving = false;
                    this.toastService.show('Error saving firm. Please check logs.', 'error');
                }
            });
        }
    }

    close(): void {
        this.router.navigate(['/procurement/maintenance/repairing-firms']);
    }
}
