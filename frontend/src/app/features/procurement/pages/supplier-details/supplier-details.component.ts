import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
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
    private cdr = inject(ChangeDetectorRef);

    supplier: Supplier | undefined;
    isLoading = false;
    routeId: string | null = null;

    ngOnInit(): void {
        console.log('[DEBUG] SupplierDetailsComponent: VERSION 2026-03-11-0530 initialized');
        this.routeId = this.route.snapshot.paramMap.get('id');
        console.log('[DEBUG] SupplierDetailsComponent: route id is', this.routeId);
        if (this.routeId) {
            this.loadSupplier(Number(this.routeId));
        }
    }

    loadSupplier(id: number): void {
        console.log(`[DEBUG] SupplierDetailsComponent: loadSupplier called for id ${id}`);
        this.isLoading = true;
        this.cdr.detectChanges();

        this.supplierService.getSupplierById(id).pipe(
            finalize(() => {
                console.log('[DEBUG] SupplierDetailsComponent: loadSupplier request finalized');
                this.isLoading = false;
                this.cdr.detectChanges();
            })
        ).subscribe({
            next: (data: Supplier) => {
                console.log('[DEBUG] SupplierDetailsComponent: Received data:', data);
                this.supplier = data;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('[ERROR] SupplierDetailsComponent: Error fetching supplier details:', err);
                this.cdr.detectChanges();
            }
        });
    }

    goBack() {
        this.router.navigate(['procurement', 'suppliers']);
    }
}
