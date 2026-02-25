import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AssetService } from '../../services/asset.service';
import { Asset } from '../../models/asset.model';
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

  allAssets: Asset[] = [];
  filteredAssets: Asset[] = [];
  viewAssets: Asset[] = [];
  loading = true;

  search = '';
  filterStatus = '';
  filterCategory = '';
  pageSize = 10;
  currentPage = 1;
  totalPages = 1;
  allSelected = false;

  get statusCounts(): Record<string, number> {
    const counts: Record<string, number> = { Deployed: 0, Available: 0, 'In Repair': 0, Retired: 0 };
    this.allAssets.forEach(a => counts[a.status] = (counts[a.status] || 0) + 1);
    return counts;
  }

  get totalValue(): number {
    return this.allAssets.reduce((sum, a) => sum + (a.purchaseCost || 0), 0);
  }

  get categories(): string[] {
    return [...new Set(this.allAssets.map(a => a.category).filter(Boolean) as string[])];
  }

  ngOnInit(): void {
    this.assetService.getAll().subscribe({
      next: (data: Asset[]) => {
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
          a.product.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q) ||
          (a.serial || '').toLowerCase().includes(q) ||
          (a.checkedOutTo || '').toLowerCase().includes(q) ||
          (a.category || '').toLowerCase().includes(q) ||
          (a.location || '').toLowerCase().includes(q)
      );
    }

    if (this.filterStatus) {
      filtered = filtered.filter((a) => a.status === this.filterStatus);
    }

    if (this.filterCategory) {
      filtered = filtered.filter((a) => a.category === this.filterCategory);
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

  onRowSelect(asset: Asset, ev: Event): void {
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

  private selectedIds(): string[] {
    return this.allAssets.filter((a) => a.selected).map((a) => a.id);
  }

  get selectedCount(): number {
    return this.allAssets.filter((a) => a.selected).length;
  }

  onRowClick(asset: Asset): void {
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
}
