import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge';

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

    assetId: string | null = null;
    asset: any = {
        name: 'Dell XPS 15 Laptop',
        purchasedDate: '12 Jan 2026',
        purchasedPrice: '250,000',
        supplier: 'Nanotec',
        category: 'Computer',
        serialNumber: '2233757575',
        isAssigned: 'Yes',
        orderId: '333444',
        warranty: '3 years',
        status: 'In Use',
        specifications: [
            { label: 'RAM', value: '16GB' },
            { label: 'Storage', value: '1TB' },
            { label: 'Processor', value: 'Intel i7' },
            { label: 'Color', value: 'Silver' }
        ]
    };

    ngOnInit(): void {
        this.assetId = this.route.snapshot.paramMap.get('id');
        // In a real app, you would fetch details by this.assetId
    }

    onClose(): void {
        this.router.navigate(['/admin/track-assets']);
    }

    onStatusChange(newStatus: string): void {
        this.asset.status = newStatus;
    }
}
