import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
    selector: 'app-supplier-create',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './supplier-create.component.html',
    styleUrls: ['./supplier-create.component.css']
})
export class SupplierCreateComponent {
    private router = inject(Router);

    form = {
        name: '',
        id: '',
        contactNo: '',
        url: '',
        email: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        postalCode: ''
    };

    saveAndExit() {
        // In a real app, save to backend here
        console.log('New Supplier:', this.form);
        this.router.navigate(['procurement', 'suppliers']);
    }

    close() {
        this.router.navigate(['procurement', 'suppliers']);
    }
}
