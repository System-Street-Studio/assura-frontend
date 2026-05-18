import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DataTableComponent, ColumnDef } from '../../../../shared/components/data-table/data-table';
import { ActionButtonComponent } from '../../../../shared/components/action-button/action-button';

@Component({
    selector: 'app-my-assets',
    standalone: true,
    imports: [
        CommonModule,
        DataTableComponent,
        ActionButtonComponent
    ],
    templateUrl: './my-assets.html',
    styleUrls: ['./my-assets.css']
})
export class MyAssetsComponent {
    private router = inject(Router);

    columns: ColumnDef[] = [
        { key: 'id', label: 'ID', type: 'link' },
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'category', label: 'Category', type: 'text' },
        { key: 'status', label: 'Status', type: 'status' }
    ];

    assets = [
        { id: '123A', name: 'Dell XPS15', category: 'Computer', status: 'In Use' },
        { id: '124B', name: 'MacBook Pro', category: 'Computer', status: 'In Use' },
        { id: '235C', name: 'HP Monitor', category: 'Computer', status: 'In Use' }
    ];

    onAssetClick(asset: any): void {
        this.router.navigate(['/admin/track-assets', asset.id]);
    }
}
