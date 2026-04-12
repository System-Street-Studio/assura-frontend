import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AssetService } from '../../services/asset.service';
import { AssetDetail } from '../../models/asset.model';
import { ToastService } from '../../../../shared/services/toast.service';
import { ResultOverlayComponent } from '../../../../shared/components/result-overlay/result-overlay';
import QRCode from 'qrcode';

@Component({
  selector: 'app-asset-details',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, ResultOverlayComponent],
  templateUrl: './asset-details.html',
  styleUrls: ['./asset-details.css'],
})
export class AssetDetailsComponent implements OnInit {
  private assetService = inject(AssetService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private toast = inject(ToastService);

  asset!: AssetDetail;
  activeTab = 'about';
  showDeleteConfirm = false;
  deleting = false;
  qrDataUrl = '';

  showResult = false;
  resultType: 'success' | 'error' = 'success';
  resultTitle = '';
  resultMessage = '';

  /* ── Check-in modal ── */
  showCheckinModal = false;
  checkinProcessing = false;
  checkinCondition: 'Good' | 'Fair' | 'Damaged' = 'Good';
  checkinNotes = '';

  tabs = [
    { id: 'about', label: 'About' },
    { id: 'checkout-log', label: 'Checkout Log' },
    { id: 'maintenances', label: 'Maintenances' },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || '';
    if (!id) {
      this.router.navigate(['/inventory/assets']);
      return;
    }
    this.assetService.getAssetById(id).subscribe({
      next: (a: AssetDetail) => {
        this.asset = a;
        this.generateQr(a.assetCode);
      },
      error: () => {
        this.toast.error('Failed to load asset details');
        this.router.navigate(['/inventory/assets']);
      },
    });
  }

  private async generateQr(value: string): Promise<void> {
    try {
      this.qrDataUrl = await QRCode.toDataURL(value, {
        width: 120,
        margin: 1,
        color: { dark: '#0b6c78', light: '#ffffff' },
      });
    } catch {
      this.qrDataUrl = '';
    }
  }

  goBack(): void {
    this.location.back();
  }

  setTab(tabId: string): void {
    this.activeTab = tabId;
  }

  getStatusClass(): string {
    if (!this.asset || !this.asset.status) return '';
    return this.asset.status.toString().toLowerCase().replace(' ', '-');
  }

  onPrint(): void {
    window.print();
  }

  onCheckin(): void {
    this.checkinCondition = 'Good';
    this.checkinNotes = '';
    this.showCheckinModal = true;
  }

  cancelCheckin(): void {
    this.showCheckinModal = false;
  }

  confirmCheckin(): void {
    this.checkinProcessing = true;
    this.assetService
      .checkinAsset(this.asset.id, this.checkinCondition, this.checkinNotes)
      .subscribe({
        next: (updated: AssetDetail) => {
          this.showCheckinModal = false;
          this.checkinProcessing = false;

          this.asset = {
            ...this.asset,
            status: updated.status,
            assignedUserName: undefined,
          };

          this.resultType = 'success';
          this.resultTitle = 'Checked In!';
          this.resultMessage = `Asset ${this.asset.assetCode} has been checked in successfully.`;
          this.showResult = true;
        },
        error: () => {
          this.checkinProcessing = false;
          this.showCheckinModal = false;
          this.toast.error('Check-in failed');
        },
      });
  }

  onClone(): void {
    this.router.navigate(['/inventory/assets', this.asset.id, 'clone']);
  }

  onEdit(): void {
    this.router.navigate(['/inventory/assets', this.asset.id, 'edit']);
  }

  onDelete(): void {
    this.showDeleteConfirm = true;
  }

  confirmDelete(): void {
    this.deleting = true;
    this.assetService.deleteAsset(this.asset.id).subscribe({
      next: () => {
        this.showDeleteConfirm = false;
        this.deleting = false;
        this.resultType = 'success';
        this.resultTitle = 'Deleted!';
        this.resultMessage = `Asset ${this.asset.assetCode} has been removed.`;
        this.showResult = true;
        setTimeout(() => this.onResultClosed(), 2000);
      },
      error: () => {
        this.showDeleteConfirm = false;
        this.deleting = false;
        this.toast.error('Failed to delete asset');
      },
    });
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
  }

  getStatusLabel(status: string | number): string {
    const s = status?.toString() || '';
    switch (s) {
      case 'InUse': return 'In Use';
      case 'InStore': return 'In Store';
      case 'UnderMaintenance': return 'Under Maintenance';
      case '1': return 'In Use';
      case '2': return 'In Store';
      case '3': return 'Under Maintenance';
      default: return s;
    }
  }

  onResultClosed(): void {
    this.showResult = false;
    this.router.navigate(['/inventory/assets']);
  }
}
