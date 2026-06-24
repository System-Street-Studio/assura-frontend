import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
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
    private cdr = inject(ChangeDetectorRef);

    firms: RepairingFirmDto[] = [];
    filteredFirms: RepairingFirmDto[] = [];
    isLoading = false;

    // Pagination
    currentPage = 1;
    pageSize = 10;
    totalPages = 1;
    pageNumbers: number[] = [];
    pagedFirms: RepairingFirmDto[] = [];

    ngOnInit(): void {
        this.loadFirms();
    }

    loadFirms(): void {
        this.isLoading = true;
        this.procurementService.getRepairingFirms().subscribe({
            next: (data) => {
                console.log('[DEBUG] RepairingFirmsComponent: Data received', data);
                this.firms = data || [];
                this.filteredFirms = [...this.firms];
                this.isLoading = false;
                this.updatePagination();
                this.cdr.detectChanges();
                console.log('[DEBUG] RepairingFirmsComponent: isLoading set to false, firms count:', this.firms.length);
            },
            error: (err) => {
                console.error('[DEBUG] RepairingFirmsComponent: Error received', err);
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
        this.totalPages = Math.ceil(this.filteredFirms.length / this.pageSize) || 1;
        this.pageNumbers = Array.from({ length: this.totalPages }, (_, i) => i + 1);

        const start = (this.currentPage - 1) * this.pageSize;
        this.pagedFirms = this.filteredFirms.slice(start, start + this.pageSize);

        console.log(`[DEBUG] RepairingFirmsComponent: Updated pagination. totalPages: ${this.totalPages}, pagedFirms count: ${this.pagedFirms.length}`);
    }


    goToPage(page: number): void {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.updatePagination();
        }
    }

    editFirm(id: number): void {
        this.router.navigate(['/procurement/maintenance/repairing-firms/edit', id]);
    }

    navigateToCreate(): void {
        this.router.navigate(['/procurement/maintenance/repairing-firms/create']);
    }

    goBack(): void {
        this.router.navigate(['/procurement/maintenance']);
    }
}
