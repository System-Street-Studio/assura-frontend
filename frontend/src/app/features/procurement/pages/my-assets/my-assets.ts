import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DataTableComponent, ColumnDef } from '../../../../shared/components/data-table/data-table';

@Component({
    selector: 'app-procurement-my-assets',
    standalone: true,
    imports: [
        CommonModule,
        DataTableComponent
    ],
    templateUrl: './my-assets.html',
    styleUrls: ['./my-assets.css']
})
export class ProcurementMyAssetsComponent {
    private router = inject(Router);

    columns: ColumnDef[] = [
        { key: 'id', label: 'ID', type: 'link' },
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'category', label: 'Category', type: 'text' },
        { key: 'status', label: 'Status', type: 'status' }
    ];

    assets = [
        { id: '456P', name: 'MacBook Air', category: 'Computer & Peripherals', status: 'In Use' },
        { id: '789Q', name: 'Dell Monitor', category: 'Office Equipment', status: 'In Use' }
    ];

    onAssetClick(asset: any): void {
        // Since procurement doesn't have an asset details page yet, we can redirect to admin's if appropriate
        // or just log for now. Given the requirement is to "see", we'll just show the list.
        this.router.navigate(['/admin/track-assets', asset.id]);
    }
}
