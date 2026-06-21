import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge';
import { AssetService } from '../../../../core/services/asset.service';
import QRCode from 'qrcode';

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
    qrDataUrl = '';

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

                // Generate QR code using AssetCode for mobile scanner compatibility
                if (data.assetCode) {
                    this.generateQr(data.assetCode);
                }

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
        const statusMap: Record<string, number> = {
            'In Use': 1, // InUse
            'In Store': 2, // InStore
            'Repairing': 3, // UnderMaintenance
            'Discarded': 4 // Discarded
        };

        const statusEnumVal = statusMap[newStatus];

        this.assetService.updateAssetStatus(this.asset.id, statusEnumVal).subscribe({
            next: (response) => {
                console.log('Status updated successfully');
                this.asset.status = newStatus;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Failed to update status:', err);
            }
        });
    }


    private async generateQr(value: string): Promise<void> {
        try {
            this.qrDataUrl = await QRCode.toDataURL(value, {
                width: 120,
                margin: 1,
                color: { dark: '#0b6c78', light: '#ffffff' },
            });
            this.cdr.detectChanges();
        } catch (err) {
            console.error('Failed to generate QR code:', err);
            this.qrDataUrl = '';
        }
    }
}
