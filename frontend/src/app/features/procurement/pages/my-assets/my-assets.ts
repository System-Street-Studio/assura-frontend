import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DataTableComponent, ColumnDef } from '../../../../shared/components/data-table/data-table';
import { AssetService } from '../../../../core/services/asset.service';
import { Asset } from '../../../../shared/models/asset.model';

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
export class ProcurementMyAssetsComponent implements OnInit {
    private router = inject(Router);
    private assetService = inject(AssetService);
    private cdr = inject(ChangeDetectorRef);

    columns: ColumnDef[] = [
        { key: 'id', label: 'ID', type: 'link' },
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'category', label: 'Category', type: 'text' },
        { key: 'status', label: 'Status', type: 'status' }
    ];

    assets: any[] = [];
    loading = true;

    ngOnInit(): void {
        this.fetchMyAssets();
    }

    fetchMyAssets(): void {
        this.loading = true;
        this.assetService.getMyAssets().subscribe({
            next: (data: Asset[]) => {
                this.assets = data.map(asset => ({
                    id: asset.assetCode || `AST-${asset.id}`,
                    realId: asset.id,
                    name: asset.productName || 'N/A',
                    category: asset.categoryName || 'N/A',
                    status: this.formatStatus(asset.status)
                }));
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error fetching procurement my assets:', err);
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    formatStatus(status: any): string {
        if (typeof status === 'number') {
            switch (status) {
                case 1: return 'In Use';
                case 2: return 'In Store';
                case 3: return 'Under Maintenance';
                case 4: return 'Discarded';
                case 5: return 'Transferred';
                case 6: return 'Lost';
                default: return 'Unknown';
            }
        }
        if (typeof status === 'string') {
            return status;
        }
        return 'Unknown';
    }

    onAssetClick(asset: any): void {
        this.router.navigate(['/admin/track-assets', asset.realId || asset.id]);
    }
}
