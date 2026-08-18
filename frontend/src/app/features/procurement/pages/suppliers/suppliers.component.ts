import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';
import { Supplier } from '../../../../core/models/supplier.model';
import { SupplierService } from '../../../../core/services/supplier.service';

@Component({
    selector: 'app-suppliers',
    standalone: true,
    imports: [CommonModule, MatIconModule, FormsModule, PaginationComponent],
    templateUrl: './suppliers.component.html',
    styleUrls: ['./suppliers.component.css']
})
export class SuppliersComponent implements OnInit {
    private router = inject(Router);
    private supplierService = inject(SupplierService);
    private cdr = inject(ChangeDetectorRef);

    searchQuery = '';
    suppliers: Supplier[] = [];
    isLoading = false;

    // Pagination
    pageSize = 20;
    currentPage = 1;

    ngOnInit(): void {
        console.log('[DEBUG] SuppliersComponent: ngOnInit started');
        this.loadSuppliers();
    }

    loadSuppliers(): void {
        console.log('[DEBUG] SuppliersComponent: loadSuppliers calling service');
        this.isLoading = true;
        this.cdr.detectChanges(); // Trigger show loading

        this.supplierService.getSuppliers().pipe(
            finalize(() => {
                console.log('[DEBUG] SuppliersComponent: loadSuppliers request finalized');
                this.isLoading = false;
                this.cdr.detectChanges(); // Force UI update
            })
        ).subscribe({
            next: (data: Supplier[]) => {
                console.log('[DEBUG] SuppliersComponent: Received data:', data);
                this.suppliers = data || [];
                console.log('[DEBUG] SuppliersComponent: suppliers count:', this.suppliers.length);
                this.cdr.detectChanges(); // Force UI update
            },
            error: (err) => {
                console.error('[DEBUG] SuppliersComponent: Error fetching suppliers:', err);
                this.cdr.detectChanges(); // Force UI update
            }
        });
    }

    get filteredSuppliers(): Supplier[] {
        if (!this.suppliers) return [];
        const q = (this.searchQuery || '').toLowerCase();
        if (!q) return this.suppliers;
        return this.suppliers.filter(s => {
            const idMatch = s.id?.toString().toLowerCase().includes(q);
            const nameMatch = s.name?.toLowerCase().includes(q);
            return idMatch || nameMatch;
        });
    }

    get totalPages(): number {
        return Math.max(1, Math.ceil(this.filteredSuppliers.length / this.pageSize));
    }

    get pageNumbers(): number[] {
        return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }

    get pagedSuppliers(): Supplier[] {
        const start = (this.currentPage - 1) * this.pageSize;
        return this.filteredSuppliers.slice(start, start + this.pageSize);
    }

    goToPage(page: number) {
        if (page >= 1 && page <= this.totalPages) this.currentPage = page;
    }

    onSearch() {
        this.currentPage = 1;
    }

    navigateToDetails(id: number) {
        this.router.navigate(['procurement', 'suppliers', id]);
    }

    onAddNew() {
        this.router.navigate(['procurement', 'suppliers', 'create']);
    }
}
