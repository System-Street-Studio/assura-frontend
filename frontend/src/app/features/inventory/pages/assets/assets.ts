import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AssetService } from '../../services/asset.service';
import { AssetDetail } from '../../models/asset.model';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-assets',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './assets.html',
  styleUrls: ['./assets.css'],
})
export class AssetsComponent implements OnInit {
  private assetService = inject(AssetService);
  private router = inject(Router);
  private toast = inject(ToastService);

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

  get statusCounts(): Record<string, number> {
    const counts: Record<string, number> = { InUse: 0, InStore: 0, UnderMaintenance: 0, Discarded: 0, Transferred: 0, Lost: 0 };
    this.allAssets.forEach(a => counts[a.status] = (counts[a.status] || 0) + 1);
    return counts;
  }

  get totalValue(): number {
    return this.allAssets.reduce((sum, a) => sum + (a.purchaseValue || 0), 0);
  }

  get categories(): string[] {
    return [...new Set(this.allAssets.map(a => a.categoryName).filter(Boolean) as string[])];
  }

  ngOnInit(): void {
    this.assetService.getAll().subscribe({
      next: (data: AssetDetail[]) => {
        this.allAssets = data;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toast.error('Failed to load assets');
      },
    });
  }

  applyFilters(): void {
    let filtered = this.allAssets.slice();

    if (this.search.trim()) {
      const q = this.search.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.productName.toLowerCase().includes(q) ||
          a.assetCode.toLowerCase().includes(q) ||
          (a.serialNumber || '').toLowerCase().includes(q) ||
          (a.assignedUserName || '').toLowerCase().includes(q) ||
          (a.categoryName || '').toLowerCase().includes(q) ||
          (a.divisionName || '').toLowerCase().includes(q)
      );
    }

    if (this.filterStatus) {
      filtered = filtered.filter((a) => a.status === this.filterStatus);
    }

    if (this.filterCategory) {
      filtered = filtered.filter((a) => a.categoryName === this.filterCategory);
    }

    this.filteredAssets = filtered;
    this.totalPages = Math.max(1, Math.ceil(filtered.length / this.pageSize));
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    this.updateView();
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

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
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
    if (!value) return '—';
    return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 0 });
  }

  get selectedCount(): number {
    return this.allAssets.filter((a) => a.selected).length;
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
}
