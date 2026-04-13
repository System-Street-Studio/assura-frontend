import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SupplierService } from '../../../../core/services/supplier.service';
import { CreateSupplierRequest } from '../../../../core/models/supplier.model';

@Component({
    selector: 'app-supplier-create',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './supplier-create.component.html',
    styleUrls: ['./supplier-create.component.css']
})
export class SupplierCreateComponent {
    private router = inject(Router);
    private supplierService = inject(SupplierService);

    private fb = inject(FormBuilder);
    supplierForm: FormGroup;

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
            Name: formValue.name,
            Phone: formValue.contactNo,
            Email: formValue.email,
            Address: `${formValue.addressLine1} ${formValue.addressLine2}, ${formValue.city}, ${formValue.postalCode}`.trim(),
            Website: formValue.url
        };

        console.log('[DEBUG] Sending supplier data:', supplierData);

        this.supplierService.createSupplier(supplierData).subscribe({
            next: (id) => {
                console.log('[DEBUG] Supplier created successfully with ID:', id);
                alert('Supplier created successfully!');
                this.router.navigate(['procurement', 'suppliers']);
            },
            error: (err: any) => {
                console.error('[ERROR] Error creating supplier:', err);
                alert('Failed to create supplier. Please check the console for details.');
            }
        });
    }

    close() {
        this.router.navigate(['procurement', 'suppliers']);
    }
}
