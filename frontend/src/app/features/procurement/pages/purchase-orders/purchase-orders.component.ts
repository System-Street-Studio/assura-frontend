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
    private instanceId = Math.random().toString(36).substring(7);

    // Data from Backend
    orders: PurchasingOrderSummaryDto[] = [];
    requests: AssetRequestDto[] = [];
    isLoading = false; // Start as false, let loadData handle it
    private loadedOnce = false;

    ngOnInit(): void {
        console.log(`[DEBUG] PurchaseOrdersComponent [${this.instanceId}]: ngOnInit called`);
        this.loadData();
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

    get ordersTotalPages(): number {
        return Math.max(1, Math.ceil(this.orders.length / this.ordersPageSize));
    }

    get ordersPageNumbers(): number[] {
        return Array.from({ length: this.ordersTotalPages }, (_, i) => i + 1);
    }

    get pagedOrders() {
        return this.orders.slice((this.ordersCurrentPage - 1) * this.ordersPageSize, this.ordersCurrentPage * this.ordersPageSize);
    }

    goToOrdersPage(page: number) {
        if (page >= 1 && page <= this.ordersTotalPages) this.ordersCurrentPage = page;
    }

    navigateToDetails(id: number) {
        this.router.navigate(['procurement', 'purchase-orders', id]);
    }

    navigateToCreate() {
        this.router.navigate(['procurement', 'purchase-orders', 'create']);
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
            options: [
                { label: 'Information Technology', value: 'IT', checked: false },
                { label: 'Industrial Services', value: 'IS', checked: false },
                { label: 'Electronics and Microelectronics', value: 'EM', checked: false },
                { label: 'Communication Engineering', value: 'CE', checked: false },
                { label: 'Space Applications', value: 'SA', checked: false },
                { label: 'Astronomy', value: 'AST', checked: false },
                { label: 'Admin', value: 'ADM', checked: false },
                { label: 'Finance', value: 'FIN', checked: false },
                { label: 'Procurement', value: 'PRO', checked: false },
                { label: 'Stores', value: 'STR', checked: false },
                { label: 'Human Resource', value: 'HR', checked: false }
            ]
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
