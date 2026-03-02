import { Component, inject } from '@angular/core';
import { FilterDropdownComponent, FilterGroup } from '../../../../shared/components/filter-dropdown/filter-dropdown';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
    selector: 'app-purchase-orders',
    standalone: true,
    imports: [CommonModule, MatIconModule, FormsModule, FilterDropdownComponent, PaginationComponent],
    templateUrl: './purchase-orders.component.html',
    styleUrls: ['./purchase-orders.component.css']
})
export class PurchaseOrdersComponent {
    private router = inject(Router);

    // Mock Data for "List of Purchasing Orders"
    orders = [
        { id: 'S-2339', department: 'Information Technology', date: '12 Jan 2026' },
        { id: 'S-7839', department: 'Astronomy', date: '12 Jan 2026' },
        { id: 'S-1120', department: 'Finance', date: '15 Jan 2026' },
        { id: 'S-4402', department: 'Human Resource', date: '18 Jan 2026' },
        { id: 'S-3310', department: 'Admin', date: '20 Jan 2026' },
        { id: 'S-9901', department: 'Space Applications', date: '22 Jan 2026' },
        { id: 'S-5521', department: 'Communication Engineering', date: '25 Jan 2026' },
    ];

    // Orders table pagination
    ordersPageSize = 5;
    ordersCurrentPage = 1;
    get ordersTotalPages(): number { return Math.max(1, Math.ceil(this.orders.length / this.ordersPageSize)); }
    get ordersPageNumbers(): number[] { return Array.from({ length: this.ordersTotalPages }, (_, i) => i + 1); }
    get pagedOrders() { return this.orders.slice((this.ordersCurrentPage - 1) * this.ordersPageSize, this.ordersCurrentPage * this.ordersPageSize); }
    goToOrdersPage(page: number) { if (page >= 1 && page <= this.ordersTotalPages) this.ordersCurrentPage = page; }

    navigateToDetails(id: string) {
        this.router.navigate(['procurement', 'purchase-orders', id]);
    }

    navigateToCreate() {
        this.router.navigate(['procurement', 'purchase-orders', 'create']);
    }


    // Mock Data for "Purchasing Order Requests"
    requests = [
        {
            id: 1,
            name: 'Alison paul',
            department: 'Information Technology',
            time: '1 day ago',
            employee: 'Alison Paul',
            division: 'Information Technology',
            date: '12 Jan 2026',
            specs: {
                ram: '12GB',
                storage: '1TB',
                processor: 'Intel 14th gen i7'
            },
            note: 'I am a new Employee. So, I need a laptop'
        },
        {
            id: 2,
            name: 'Amarabandu Roopasinghe',
            department: 'HR',
            time: '2 day ago',
            employee: 'Amarabandu Roopasinghe',
            division: 'Human Resource',
            date: '14 Jan 2026',
            specs: {
                ram: '8GB',
                storage: '512GB',
                processor: 'Intel 13th gen i5'
            },
            note: 'Replacement for damaged monitor and docking station.'
        },
        {
            id: 3,
            name: 'Thiranjaya Siriwardhana',
            department: 'Admin',
            time: '12 . 12 . 2025',
            employee: 'Thiranjaya Siriwardhana',
            division: 'Administration',
            date: '12 Dec 2025',
            specs: {
                ram: '16GB',
                storage: '1TB SSD',
                processor: 'M3 Pro'
            },
            note: 'Urgent requirement for graphic design project.'
        }
    ];

    // Requests list pagination
    requestsPageSize = 5;
    requestsCurrentPage = 1;
    get requestsTotalPages(): number { return Math.max(1, Math.ceil(this.requests.length / this.requestsPageSize)); }
    get requestsPageNumbers(): number[] { return Array.from({ length: this.requestsTotalPages }, (_, i) => i + 1); }
    get pagedRequests() { return this.requests.slice((this.requestsCurrentPage - 1) * this.requestsPageSize, this.requestsCurrentPage * this.requestsPageSize); }
    goToRequestsPage(page: number) { if (page >= 1 && page <= this.requestsTotalPages) this.requestsCurrentPage = page; }

    // Mock Data for "Asset Request" Details (Currently selected)
    selectedRequest = this.requests[0];

    selectRequest(request: any) {
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
