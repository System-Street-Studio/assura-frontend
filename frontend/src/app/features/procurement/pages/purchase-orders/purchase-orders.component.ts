import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { forkJoin } from 'rxjs';
import { FilterDropdownComponent, FilterGroup } from '../../../../shared/components/filter-dropdown/filter-dropdown';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProcurementService } from '../../services/procurement.service';
import { PurchasingOrderSummaryDto, AssetRequestDto } from '../../models/purchase-order.model';
import { DivisionService } from '../../../inventory/services/division.service';

@Component({
    selector: 'app-purchase-orders',
    standalone: true,
    imports: [CommonModule, MatIconModule, FormsModule, PaginationComponent],
    templateUrl: './purchase-orders.component.html',
    styleUrls: ['./purchase-orders.component.css']
})
export class PurchaseOrdersComponent implements OnInit {
    private router = inject(Router);
    private procurementService = inject(ProcurementService);
    private cdr = inject(ChangeDetectorRef);
    private divisionService = inject(DivisionService);
    private instanceId = Math.random().toString(36).substring(7);

    // Data from Backend
    orders: PurchasingOrderSummaryDto[] = [];
    requests: AssetRequestDto[] = [];
    isLoading = false; // Start as false, let loadData handle it
    private loadedOnce = false;

    // Search state
    searchTerm = '';

    ngOnInit(): void {
        console.log(`[DEBUG] PurchaseOrdersComponent [${this.instanceId}]: ngOnInit called`);
        this.loadData();
        this.loadDivisions();
    }

    private loadDivisions(): void {
        this.divisionService.getAll().subscribe({
            next: (divisions) => {
                const divisionGroup = this.filterGroups.find(g => g.title === 'Assign Divisions');
                if (divisionGroup) {
                    divisionGroup.options = divisions.map(d => ({
                        label: d.name,
                        value: d.name.toLowerCase().replace(/\s+/g, '_'),
                        checked: false,
                    }));
                }
            },
        });
    }

    loadData(): void {
        if (this.isLoading) {
            console.log(`[DEBUG] PurchaseOrdersComponent [${this.instanceId}]: loadData skipped (already loading)`);
            return;
        }

        console.log(`[DEBUG] PurchaseOrdersComponent [${this.instanceId}]: loadData() started`);
        this.isLoading = true;
        this.cdr.detectChanges();

        forkJoin({
            orders: this.procurementService.getOrders(),
            requests: this.procurementService.getPendingRequests()
        }).subscribe({
            next: (result) => {
                console.log(`[DEBUG] PurchaseOrdersComponent [${this.instanceId}]: Received ${result.orders.length} orders and ${result.requests.length} requests`);
                this.orders = result.orders;
                
                // Filter to show only new asset requests (Asset / NewAsset / New Asset)
                this.requests = result.requests.filter(r => 
                    r.type?.toLowerCase() === 'asset' || 
                    r.type?.toLowerCase() === 'newasset' || 
                    r.type?.toLowerCase() === 'new asset'
                );

                if (this.requests.length > 0) {
                    this.selectedRequest = this.requests[0];
                } else {
                    this.selectedRequest = null;
                }

                this.isLoading = false;
                this.loadedOnce = true;
                console.log(`[DEBUG] PurchaseOrdersComponent [${this.instanceId}]: isLoading set to false. orders.length=${this.orders.length}`);
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error(`[DEBUG] PurchaseOrdersComponent [${this.instanceId}]: Error in forkJoin:`, err);
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    // Orders table pagination
    ordersPageSize = 5;
    ordersCurrentPage = 1;

    get filteredOrders(): PurchasingOrderSummaryDto[] {
        if (!this.searchTerm) {
            return this.orders;
        }
        const term = this.searchTerm.toLowerCase();
        return this.orders.filter(o => 
            (o.orderNumber && o.orderNumber.toLowerCase().includes(term)) ||
            (o.supplierName && o.supplierName.toLowerCase().includes(term))
        );
    }

    onSearchChange() {
        this.ordersCurrentPage = 1;
    }

    get ordersTotalPages(): number {
        return Math.max(1, Math.ceil(this.filteredOrders.length / this.ordersPageSize));
    }

    get ordersPageNumbers(): number[] {
        return Array.from({ length: this.ordersTotalPages }, (_, i) => i + 1);
    }

    get pagedOrders() {
        return this.filteredOrders.slice((this.ordersCurrentPage - 1) * this.ordersPageSize, this.ordersCurrentPage * this.ordersPageSize);
    }

    goToOrdersPage(page: number) {
        if (page >= 1 && page <= this.ordersTotalPages) this.ordersCurrentPage = page;
    }

    navigateToDetails(id: number) {
        this.router.navigate(['procurement', 'purchase-orders', id]);
    }

    navigateToCreate(request?: AssetRequestDto) {
        if (request) {
            this.router.navigate(['procurement', 'purchase-orders', 'create'], { state: { request } });
        } else {
            this.router.navigate(['procurement', 'purchase-orders', 'create']);
        }
    }

    // Requests list pagination
    requestsPageSize = 5;
    requestsCurrentPage = 1;

    get requestsTotalPages(): number {
        return Math.max(1, Math.ceil(this.requests.length / this.requestsPageSize));
    }

    get requestsPageNumbers(): number[] {
        return Array.from({ length: this.requestsTotalPages }, (_, i) => i + 1);
    }

    get pagedRequests() {
        return this.requests.slice((this.requestsCurrentPage - 1) * this.requestsPageSize, this.requestsCurrentPage * this.requestsPageSize);
    }

    goToRequestsPage(page: number) {
        if (page >= 1 && page <= this.requestsTotalPages) this.requestsCurrentPage = page;
    }

    // Details for currently selected request
    selectedRequest: AssetRequestDto | null = null;

    selectRequest(request: AssetRequestDto) {
        this.selectedRequest = request;
    }

    // Filter Logic
    isFilterOpen = false;

    filterGroups: FilterGroup[] = [
        {
            title: 'Assign Divisions',
            required: true,
            options: [] // Populated dynamically from DivisionService
        }
    ];

    toggleFilter() {
        this.isFilterOpen = !this.isFilterOpen;
    }

    onFilterClose(groups: FilterGroup[]) {
        this.isFilterOpen = false;
        // Logic to apply filters would go here
        console.log('Filters applied:', groups);
    }
}
