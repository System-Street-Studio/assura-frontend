import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SupplierService } from '../../../../core/services/supplier.service';

@Component({
    selector: 'app-supplier-create',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './supplier-create.component.html',
    styleUrls: ['./supplier-create.component.css']
})
export class SupplierCreateComponent implements OnInit {
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private supplierService = inject(SupplierService);
    private fb = inject(FormBuilder);

    supplierForm: FormGroup;
    isEdit = false;
    supplierId: number | null = null;

    constructor() {
        this.supplierForm = this.fb.group({
            name: ['', Validators.required],
            contactNo: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
            email: ['', [Validators.required, Validators.email]],
            url: ['', Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')],
            addressLine1: ['', Validators.required],
            addressLine2: [''],
            city: ['', Validators.required],
            postalCode: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        const idParam = this.route.snapshot.paramMap.get('id');
        if (idParam) {
            this.isEdit = true;
            this.supplierId = Number(idParam);
            this.loadSupplierData(this.supplierId);
        }
    }

    loadSupplierData(id: number): void {
        this.supplierService.getSupplierById(id).subscribe({
            next: (data) => {
                let addressLine1 = data.address || '';
                let addressLine2 = '';
                let city = '';
                let postalCode = '';

                if (data.address && data.address.includes(',')) {
                    const parts = data.address.split(',');
                    if (parts.length >= 3) {
                        addressLine1 = parts[0].trim();
                        city = parts[1].trim();
                        postalCode = parts[2].trim();
                    } else if (parts.length === 2) {
                        addressLine1 = parts[0].trim();
                        city = parts[1].trim();
                    }
                }

                this.supplierForm.patchValue({
                    name: data.name,
                    contactNo: data.phone || data.contactNumber || '',
                    email: data.email,
                    url: data.website || data.url || '',
                    addressLine1: addressLine1,
                    addressLine2: addressLine2,
                    city: city,
                    postalCode: postalCode
                });
            },
            error: (err) => {
                console.error('[ERROR] Error loading supplier details for edit:', err);
                alert('Failed to load supplier details.');
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

    // දත්ත ලබා ගැනීමට පහසු වීම සඳහා getters
    get f() {
        return this.supplierForm.controls;
    }

    saveAndExit() {
        if (this.supplierForm.invalid) {
            this.supplierForm.markAllAsTouched();
            return;
        }

        const formValue = this.supplierForm.getRawValue();

        const supplierData = {
            Id: this.isEdit ? this.supplierId : undefined,
            Name: formValue.name,
            Phone: formValue.contactNo,
            Email: formValue.email,
            Address: `${formValue.addressLine1} ${formValue.addressLine2}, ${formValue.city}, ${formValue.postalCode}`.trim(),
            Website: formValue.url
        };

        console.log('[DEBUG] Sending supplier data:', supplierData);

        if (this.isEdit && this.supplierId !== null) {
            this.supplierService.updateSupplier(this.supplierId, supplierData).subscribe({
                next: () => {
                    console.log('[DEBUG] Supplier updated successfully');
                    alert('Supplier updated successfully!');
                    this.router.navigate(['procurement', 'suppliers']);
                },
                error: (err: any) => {
                    console.error('[ERROR] Error updating supplier:', err);
                    alert('Failed to update supplier.');
                }
            });
        } else {
            this.supplierService.createSupplier(supplierData).subscribe({
                next: (id) => {
                    console.log('[DEBUG] Supplier created successfully with ID:', id);
                    alert('Supplier created successfully!');
                    this.router.navigate(['procurement', 'suppliers']);
                },
                error: (err: any) => {
                    console.error('[ERROR] Error creating supplier:', err);
                    alert('Failed to create supplier.');
                }
            });
        }
    }

    close() {
        this.router.navigate(['procurement', 'suppliers']);
    }
}
