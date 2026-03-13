import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupplierService } from '../../../../core/services/supplier.service';
import { CreateSupplierRequest } from '../../../../core/models/supplier.model';

@Component({
    selector: 'app-supplier-create',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './supplier-create.component.html',
    styleUrls: ['./supplier-create.component.css']
})
export class SupplierCreateComponent {
    private router = inject(Router);
    private supplierService = inject(SupplierService);

    form = {
        name: '',
        contactNo: '',
        url: '',
        email: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        postalCode: ''
    };

    saveAndExit() {
        // Map form fields to the backend command structure
        // Using PascalCase to ensure absolute compatibility if naming policy is default
        const supplierData = {
            Name: this.form.name,
            Phone: this.form.contactNo,
            Email: this.form.email,
            Address: `${this.form.addressLine1} ${this.form.addressLine2}, ${this.form.city}, ${this.form.postalCode}`.trim(),
            Website: this.form.url
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
