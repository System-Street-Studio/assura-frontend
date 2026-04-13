import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge';
import { AssetService } from '../../../../core/services/asset.service';

@Component({
    selector: 'app-asset-details',
    standalone: true,
    imports: [CommonModule, MatIconModule, FormsModule, StatusBadgeComponent],
    templateUrl: './asset-details.html',
    styleUrls: ['./asset-details.css']
})
export class AssetDetailsComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private assetService = inject(AssetService);
    private cdr = inject(ChangeDetectorRef);

    assetId: string | null = null;
    asset: any = {
        name: 'Loading...',
        status: '',
        specifications: []
    };

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.fetchAsset(parseInt(id));
        }
    }

    formatStatus(status: string): string {
        switch (status) {
            case 'InUse': return 'In Use';
            case 'InStore': return 'In Store';
            case 'UnderMaintenance': return 'Repairing';
            case 'Discarded': return 'Discarded';
            case 'Transferred': return 'Transferred';
            case 'Lost': return 'Lost';
            default: return status;
        }
    }

    fetchAsset(id: number): void {
        this.assetService.getAsset(id).subscribe({
            next: (data) => {
                this.asset = {
                    ...data,
                    name: data.productName,
                    purchasedDate: new Date(data.assetDate).toLocaleDateString(),
                    purchasedPrice: data.purchaseValue.toLocaleString(),
                    // Store the UI-friendly status for the radio buttons
                    status: this.formatStatus(data.status),
                    specifications: [
                        { label: 'RAM', value: '16GB' },
                        { label: 'Storage', value: '1TB' },
                        { label: 'Processor', value: 'Intel i7' },
                        { label: 'Color', value: 'Silver' }
                    ]
                };
                this.cdr.detectChanges();
            },
            error: (err) => console.error('Error fetching asset details:', err)
        });
    }

    onClose(): void {
        this.router.navigate(['/admin/track-assets']);
    }

    onStatusChange(newStatus: string): void {
        console.log('[DEBUG] changing status to:', newStatus);

        // Map the UI string status back to the exact Enum names expected by the backend
        const statusMap: Record<string, string> = {
            'In Use': 'InUse',
            'In Store': 'InStore',
            'Repairing': 'UnderMaintenance',
            'Discarded': 'Discarded'
        };

        const updateRequest = {
            ...this.asset,
            id: this.asset.id,
            status: statusMap[newStatus]
        };

        this.assetService.updateAssets(this.asset.id, updateRequest).subscribe({
            next: (response) => {
                console.log('Status updated successfully');
                this.asset.status = newStatus;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Failed to update status:', err);
                // Optionally revert the UI state if the backend request fails
            }
        });
    }

    onScheduleMaintenance(): void {
        this.router.navigate(['/procurement/maintenance/create'], { queryParams: { assetId: this.asset.id } });
    }
}
