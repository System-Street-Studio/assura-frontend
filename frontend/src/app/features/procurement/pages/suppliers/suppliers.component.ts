import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';
import { SUPPLIERS, Supplier } from '../supplier-details/supplier-details.component';

@Component({
    selector: 'app-suppliers',
    standalone: true,
    imports: [CommonModule, MatIconModule, FormsModule, PaginationComponent],
    templateUrl: './suppliers.component.html',
    styleUrls: ['./suppliers.component.css']
})
export class SuppliersComponent {
    private router = inject(Router);

    searchQuery = '';
    suppliers: Supplier[] = SUPPLIERS;

    // Pagination
    pageSize = 5;
    currentPage = 1;

    get filteredSuppliers(): Supplier[] {
        const q = this.searchQuery.toLowerCase();
        if (!q) return this.suppliers;
        return this.suppliers.filter(s =>
            s.id.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
        );
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

    navigateToDetails(id: string) {
        this.router.navigate(['procurement', 'suppliers', id]);
    }

    onAddNew() {
        this.router.navigate(['procurement', 'suppliers', 'create']);
    }
}
