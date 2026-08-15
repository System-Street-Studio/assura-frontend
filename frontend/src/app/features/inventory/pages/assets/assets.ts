import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AssetService } from '../../services/asset.service';
import { AssetDetail } from '../../models/asset.model';
import { ToastService } from '../../../../shared/services/toast.service';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';
import QRCode from 'qrcode';

@Component({
  selector: 'app-assets',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, PaginationComponent],
  templateUrl: './assets.html',
  styleUrls: ['./assets.css'],
})
export class AssetsComponent implements OnInit {
  private assetService = inject(AssetService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  allAssets: AssetDetail[] = [];
  filteredAssets: AssetDetail[] = [];
  viewAssets: AssetDetail[] = [];
  loading = true;

  search = '';
  filterStatus = '';
  filterCategory = '';
  pageSize = 10;
  currentPage = 1;
  totalPages = 1;
  allSelected = false;

  statusCounts: Record<string, number> = { InUse: 0, InStore: 0, UnderMaintenance: 0, Discarded: 0, Transferred: 0, Lost: 0 };
  categories: string[] = [];
  pageNumbers: number[] = [1];

  // ── Bulk QR Code Printing State ──
  showBulkQrModal = false;
  qrLoading = false;
  bulkQrItems: Array<{ asset: AssetDetail; qrUrl: string }> = [];
  printOptions = {
    showProduct: true,
    showCategory: true,
    showSerial: true,
    showDivision: true,
    columns: 2
  };

  get totalValue(): number {
    return this.allAssets.reduce((sum, a) => sum + (a.purchaseValue || 0), 0);
  }

  get selectedCount(): number {
    return this.allAssets.filter((a) => a.selected).length;
  }

  get selectedAssets(): AssetDetail[] {
    return this.allAssets.filter((a) => a.selected);
  }

  ngOnInit(): void {
    this.assetService.getAll().subscribe({
      next: (data: AssetDetail[]) => {
        this.allAssets = data || [];
        // Precompute counts and categories
        const counts: Record<string, number> = { InUse: 0, InStore: 0, UnderMaintenance: 0, Discarded: 0, Transferred: 0, Lost: 0 };
        this.allAssets.forEach(a => {
          if (a.status) counts[a.status] = (counts[a.status] || 0) + 1;
        });
        this.statusCounts = counts;
        this.categories = [...new Set(this.allAssets.map(a => a.categoryName).filter(Boolean) as string[])];

        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.toast.error('Failed to load assets');
        this.cdr.detectChanges();
      },
    });
  }

  applyFilters(): void {
    let filtered = this.allAssets.slice();

    // 1. Search Filter
    if (this.search.trim()) {
      const q = this.search.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          (a.productName || '').toLowerCase().includes(q) ||
          (a.assetCode || '').toLowerCase().includes(q) ||
          (a.serialNumber || '').toLowerCase().includes(q) ||
          (a.assignedUserName || '').toLowerCase().includes(q) ||
          (a.categoryName || '').toLowerCase().includes(q) ||
          (a.divisionName || '').toLowerCase().includes(q)
      );
    }

    // 2. Status Filter - Robust comparison
    if (this.filterStatus) {
      filtered = filtered.filter((a) => {
        if (!a.status && a.status !== 0) return false;
        const aStatus = a.status.toString().toLowerCase();
        const fStatus = this.filterStatus.toLowerCase();
        const enumMap: Record<string, string> = {
          '0': 'inuse',
          '1': 'instore',
          '2': 'undermaintenance',
          '3': 'discarded',
          '4': 'transferred',
          '5': 'lost',
          'deployed': 'inuse'
        };
        return aStatus === fStatus || enumMap[aStatus] === fStatus;
      });
    }

    // 3. Category Filter
    if (this.filterCategory) {
      filtered = filtered.filter((a) => a.categoryName === this.filterCategory);
    }

    this.filteredAssets = filtered;
    this.totalPages = Math.max(1, Math.ceil(filtered.length / this.pageSize));
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    this.pageNumbers = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.updateView();
  }

  onStatusCardClick(status: string): void {
    if (this.filterStatus === status) {
      this.filterStatus = '';
    } else {
      this.filterStatus = status;
      this.filterCategory = '';
    }
    this.currentPage = 1;
    this.applyFilters();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  setPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updateView();
  }

  get showingFrom(): number {
    return this.filteredAssets.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get showingTo(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredAssets.length);
  }

  toggleSelectAll(ev: Event): void {
    this.allSelected = (ev.target as HTMLInputElement).checked;
    this.viewAssets.forEach((a) => (a.selected = this.allSelected));
  }

  selectAllFiltered(): void {
    this.filteredAssets.forEach((a) => (a.selected = true));
    this.allSelected = true;
    this.cdr.detectChanges();
    this.toast.info(`Selected all ${this.filteredAssets.length} filtered assets`);
  }

  clearSelection(): void {
    this.allAssets.forEach((a) => (a.selected = false));
    this.allSelected = false;
    this.cdr.detectChanges();
  }

  onRowSelect(asset: AssetDetail, ev: Event): void {
    asset.selected = (ev.target as HTMLInputElement).checked;
    this.allSelected = this.viewAssets.every((a) => a.selected);
  }

  clearFilters(): void {
    this.search = '';
    this.filterStatus = '';
    this.filterCategory = '';
    this.currentPage = 1;
    this.applyFilters();
  }

  getThumbClass(product: string): string {
    const name = product.toLowerCase();
    if (name.includes('iphone') || name.includes('phone')) return 'thumb phone';
    if (name.includes('yoga') || name.includes('tablet')) return 'thumb tablet';
    if (name.includes('monitor') || name.includes('display')) return 'thumb monitor';
    return 'thumb laptop';
  }

  getThumbIcon(product: string): string {
    const name = product.toLowerCase();
    if (name.includes('iphone') || name.includes('phone')) return 'smartphone';
    if (name.includes('yoga') || name.includes('tablet')) return 'tablet';
    if (name.includes('monitor') || name.includes('display')) return 'desktop_windows';
    return 'laptop';
  }

  formatCurrency(value: number | undefined): string {
    if (value === undefined || value === null) return '—';
    return '$' + Math.round(value).toLocaleString('en-US');
  }

  onRowClick(asset: AssetDetail): void {
    this.router.navigate(['/inventory/assets', asset.id]);
  }

  onNewAsset(): void {
    this.router.navigate(['/inventory/assets/new']);
  }

  private updateView(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.viewAssets = this.filteredAssets.slice(start, start + this.pageSize);
    this.allSelected = this.viewAssets.length > 0 && this.viewAssets.every((a) => a.selected);
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'InUse': return 'In Use';
      case 'InStore': return 'In Store';
      case 'UnderMaintenance': return 'Under Maintenance';
      default: return status;
    }
  }

  // ── Bulk QR Code Operations ──
  async openBulkQrModal(): Promise<void> {
    const selected = this.selectedAssets;
    if (!selected.length) {
      this.toast.warning('Please select at least one asset to print QR codes.');
      return;
    }

    this.showBulkQrModal = true;
    this.qrLoading = true;
    this.bulkQrItems = [];
    this.cdr.detectChanges();

    const items: Array<{ asset: AssetDetail; qrUrl: string }> = [];
    for (const asset of selected) {
      let qrUrl = '';
      if (asset.qrCode && asset.qrCode.trim().length > 10) {
        qrUrl = asset.qrCode.startsWith('data:image') ? asset.qrCode : `data:image/png;base64,${asset.qrCode}`;
      } else {
        try {
          qrUrl = await QRCode.toDataURL(asset.assetCode || `AST-${asset.id}`, {
            width: 140,
            margin: 1,
            color: { dark: '#0f172a', light: '#ffffff' }
          });
        } catch {
          qrUrl = '';
        }
      }
      items.push({ asset, qrUrl });
    }

    this.bulkQrItems = items;
    this.qrLoading = false;
    this.cdr.detectChanges();
  }

  closeBulkQrModal(): void {
    this.showBulkQrModal = false;
  }

  printBulkQr(): void {
    window.print();
  }

  exportToCsv(): void {
    const assetsToExport = this.selectedCount > 0 ? this.selectedAssets : this.filteredAssets;
    if (!assetsToExport.length) {
      this.toast.warning('No assets to export');
      return;
    }
    const headers = ['Asset Code', 'Product Name', 'Category', 'Status', 'Assigned User', 'Division', 'Serial Number', 'Purchase Value (USD)', 'Warranty'];
    const rows = assetsToExport.map(a => [
      `"${a.assetCode || ''}"`,
      `"${(a.productName || '').replace(/"/g, '""')}"`,
      `"${a.categoryName || ''}"`,
      `"${a.status || ''}"`,
      `"${a.assignedUserName || ''}"`,
      `"${a.divisionName || ''}"`,
      `"${a.serialNumber || ''}"`,
      a.purchaseValue || 0,
      `"${a.warranty || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Assura_Assets_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.toast.success(`Exported ${assetsToExport.length} assets to CSV`);
  }
}
