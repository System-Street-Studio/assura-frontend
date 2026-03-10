import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Supplier } from '../../../../core/models/supplier.model';
import { SupplierService } from '../../../../core/services/supplier.service';

@Component({
    selector: 'app-supplier-details',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './supplier-details.component.html',
    styleUrls: ['./supplier-details.component.css']
})
export class SupplierDetailsComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private supplierService = inject(SupplierService);

    supplier: Supplier | undefined;
    isLoading = false;

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadSupplier(Number(id));
        }
    }

    loadSupplier(id: number): void {
        this.isLoading = true;
        this.supplierService.getSupplierById(id).subscribe({
            next: (data) => {
                this.supplier = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error fetching supplier details:', err);
                this.isLoading = false;
            }
        });
    }

    goBack() {
        this.router.navigate(['procurement', 'suppliers']);
    }
}
