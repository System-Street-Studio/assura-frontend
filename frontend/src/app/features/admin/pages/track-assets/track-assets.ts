import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar';
import { DataTableComponent, ColumnDef } from '../../../../shared/components/data-table/data-table';
import { ActionButtonComponent } from '../../../../shared/components/action-button/action-button';
import { FilterDropdownComponent, FilterGroup } from '../../../../shared/components/filter-dropdown/filter-dropdown';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';
import { AssetService } from '../../../../core/services/asset.service';
import { Asset } from '../../../../shared/models/asset.model';

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
export class TrackAssetsComponent implements OnInit {
    private router = inject(Router);
    private assetService = inject(AssetService);

    columns: ColumnDef[] = [
        { key: 'id', label: 'ID', type: 'link' },
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'category', label: 'Category', type: 'text' },
        { key: 'status', label: 'Status', type: 'status' }
    ];

    assets: any[] = [];
    filteredAssets: any[] = [];
    loading = true;

    currentPage = 1;
    pageSize = 5;
    showFilters = false;

    ngOnInit(): void {
        this.fetchAssets();
    }

    private fetchAssets(): void {
        this.loading = true;
        this.assetService.getAssets().subscribe({
            next: (data: Asset[]) => {
                this.assets = data.map(asset => ({
                    id: asset.assetCode,
                    realId: asset.id, // For navigation if needed
                    name: asset.productName,
                    category: asset.categoryName,
                    status: this.formatStatus(asset.status)
                }));
                this.filteredAssets = [...this.assets];
                this.loading = false;
            },
            error: (err) => {
                console.error('Error fetching assets:', err);
                this.loading = false;
            }
        });
    }

    private formatStatus(status: string): string {
        // Map backend status strings to display format if necessary
        // Example: 'InUse' -> 'In Use'
        switch (status) {
            case 'InUse': return 'In Use';
            case 'InStore': return 'In Store';
            case 'UnderMaintenance': return 'Repairing';
            case 'Discarded': return 'Discarded';
            default: return status;
        }
    }

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
                { label: 'Computer', value: 'Computer', checked: false },
                { label: 'Networking', value: 'Networking', checked: false },
                { label: 'Furniture', value: 'Furniture', checked: false },
                { label: 'Electronics', value: 'Electronics', checked: false }
            ]
        },
        {
            title: 'Status',
            options: [
                { label: 'In Use', value: 'In Use', checked: false },
                { label: 'Repairing', value: 'Repairing', checked: false },
                { label: 'Discarded', value: 'Discarded', checked: false },
                { label: 'In Store', value: 'In Store', checked: false }
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
        this.router.navigate(['/admin/track-assets', asset.realId || asset.id]);
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
