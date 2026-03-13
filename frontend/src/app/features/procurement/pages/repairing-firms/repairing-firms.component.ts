import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProcurementService } from '../../services/procurement.service';
import { RepairingFirmDto } from '../../models/maintenance.model';
import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';

@Component({
    selector: 'app-repairing-firms',
    standalone: true,
    imports: [CommonModule, SearchBarComponent, PaginationComponent],
    templateUrl: './repairing-firms.component.html',
    styleUrls: ['./repairing-firms.component.css']
})
export class RepairingFirmsComponent implements OnInit {
    private router = inject(Router);
    private procurementService = inject(ProcurementService);

    firms: RepairingFirmDto[] = [];
    filteredFirms: RepairingFirmDto[] = [];
    isLoading = false;

    // Pagination
    currentPage = 1;
    pageSize = 10;
    totalPages = 1;
    pageNumbers: number[] = [];

    ngOnInit(): void {
        this.loadFirms();
    }

    loadFirms(): void {
        this.isLoading = true;
        this.procurementService.getRepairingFirms().subscribe({
            next: (data) => {
                this.firms = data;
                this.filteredFirms = [...data];
                this.updatePagination();
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading repairing firms', err);
                this.isLoading = false;
            }
        });
    }

    onSearch(query: string): void {
        const q = query.toLowerCase().trim();
        this.filteredFirms = this.firms.filter(f =>
            f.name.toLowerCase().includes(q) ||
            (f.contactPerson && f.contactPerson.toLowerCase().includes(q)) ||
            (f.email && f.email.toLowerCase().includes(q))
        );
        this.currentPage = 1;
        this.updatePagination();
    }

    updatePagination(): void {
        this.totalPages = Math.ceil(this.filteredFirms.length / this.pageSize);
        this.pageNumbers = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }

    get pagedFirms(): RepairingFirmDto[] {
        const start = (this.currentPage - 1) * this.pageSize;
        return this.filteredFirms.slice(start, start + this.pageSize);
    }

    goToPage(page: number): void {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
        }
    }

    navigateToCreate(): void {
        this.router.navigate(['/procurement/maintenance/repairing-firms/create']);
    }

    goBack(): void {
        this.router.navigate(['/procurement/maintenance']);
    }
}
