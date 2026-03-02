import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar';
import { DataTableComponent, ColumnDef } from '../../../../shared/components/data-table/data-table';
import { ActionButtonComponent } from '../../../../shared/components/action-button/action-button';
import { FilterDropdownComponent, FilterGroup } from '../../../../shared/components/filter-dropdown/filter-dropdown';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';

@Component({
    selector: 'app-track-assets',
    standalone: true,
    imports: [
        CommonModule,
        SearchBarComponent,
        DataTableComponent,
        ActionButtonComponent,
        FilterDropdownComponent,
        PaginationComponent
    ],
    templateUrl: './track-assets.html',
    styleUrls: ['./track-assets.css']
})
export class TrackAssetsComponent {
    private router = inject(Router);

    columns: ColumnDef[] = [
        { key: 'id', label: 'ID', type: 'link' },
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'category', label: 'Category', type: 'text' },
        { key: 'status', label: 'Status', type: 'status' }
    ];

    assets = [
        { id: '123A', name: 'Dell XPS15', category: 'Computer', status: 'In Use' },
        { id: '234A', name: 'Cisco Switch', category: 'Networking', status: 'Repairing' },
        { id: '994D', name: 'Wooden Table', category: 'Furniture', status: 'Discarded' },
        { id: '034S', name: 'Chair', category: 'Furniture', status: 'In Store' },
        { id: '124B', name: 'MacBook Pro', category: 'Computer', status: 'In Use' },
        { id: '235C', name: 'HP Monitor', category: 'Computer', status: 'In Use' },
        { id: '995E', name: 'Office Desk', category: 'Furniture', status: 'In Store' },
        { id: '035T', name: 'Laser Printer', category: 'Electronics', status: 'Repairing' },
        { id: '126D', name: 'Lenovo ThinkPad', category: 'Computer', status: 'Discarded' },
        { id: '236F', name: 'WiFi Router', category: 'Networking', status: 'In Use' }
    ];

    filteredAssets = [...this.assets];
    currentPage = 1;
    pageSize = 5;
    showFilters = false;

    get paginatedAssets() {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        return this.filteredAssets.slice(startIndex, startIndex + this.pageSize);
    }

    get totalPages() {
        return Math.ceil(this.filteredAssets.length / this.pageSize);
    }

    get pageNumbers() {
        return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }

    filterGroups: FilterGroup[] = [
        {
            title: 'Category',
            options: [
                { label: 'Computer', value: 'computer', checked: false },
                { label: 'Networking', value: 'networking', checked: false },
                { label: 'Furniture', value: 'furniture', checked: false }
            ]
        },
        {
            title: 'Status',
            options: [
                { label: 'In Use', value: 'in use', checked: false },
                { label: 'Repairing', value: 'repairing', checked: false },
                { label: 'Discarded', value: 'discarded', checked: false },
                { label: 'In Store', value: 'in store', checked: false }
            ]
        }
    ];

    onSearch(query: string): void {
        const term = query.toLowerCase().trim();
        this.currentPage = 1; // Reset to first page
        if (!term) {
            this.filteredAssets = [...this.assets];
            return;
        }
        this.filteredAssets = this.assets.filter(asset =>
            asset.name.toLowerCase().includes(term) ||
            asset.id.toLowerCase().includes(term)
        );
    }

    onPageChange(page: number): void {
        this.currentPage = page;
    }

    onAssetClick(asset: any): void {
        this.router.navigate(['/admin/track-assets', asset.id]);
    }

    toggleFilters(): void {
        this.showFilters = !this.showFilters;
    }

    onFilterClosed(groups: FilterGroup[]): void {
        this.filterGroups = groups;
        this.showFilters = false;
        this.applyFilters();
    }

    applyFilters(): void {
        const activeCategories = this.filterGroups[0].options.filter(o => o.checked).map(o => o.label);
        const activeStatuses = this.filterGroups[1].options.filter(o => o.checked).map(o => o.label);

        this.currentPage = 1; // Reset to first page when filtering
        this.filteredAssets = this.assets.filter(asset => {
            const matchCat = activeCategories.length === 0 || activeCategories.includes(asset.category);
            const matchStatus = activeStatuses.length === 0 || activeStatuses.includes(asset.status);
            return matchCat && matchStatus;
        });
    }

    onUpdateAsset(): void {
        console.log('Update Asset clicked');
    }
}
