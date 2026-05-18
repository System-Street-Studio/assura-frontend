import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AssetService } from '../../services/asset.service';
import { AssetDetail } from '../../models/asset.model';
import { ToastService } from '../../../../shared/services/toast.service';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';

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

  get totalValue(): number {
    return this.allAssets.reduce((sum, a) => sum + (a.purchaseValue || 0), 0);
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

    // 2. Status Filter - Robust comparison (handles both string and numeric values)
    if (this.filterStatus) {
      filtered = filtered.filter((a) => {
        if (!a.status && a.status !== 0) return false;

        // Convert both to string for consistent comparison
        const aStatus = a.status.toString().toLowerCase();
        const fStatus = this.filterStatus.toLowerCase();

        // Handle numeric-to-string mappings if backend still sends ints
        // 0: InUse, 1: InStore, 2: UnderMaintenance, 3: Discarded, 4: Transferred, 5: Lost
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

  // Helper to filter from cards (can be used to clear category filter for better UX)
  onStatusCardClick(status: string): void {
    if (this.filterStatus === status) {
      this.filterStatus = ''; // Toggle off
    } else {
      this.filterStatus = status;
      this.filterCategory = ''; // Clear category when switching main status view via cards
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
