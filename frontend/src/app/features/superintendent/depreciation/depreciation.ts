import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { DepreciationService } from '../../../core/services/depreciation.service';
import {
  AssetDepreciation,
  CategoryDepreciationSummary,
  DepreciationSummary,
  AssetDepreciationSchedule
} from '../../../core/models';

@Component({
  selector: 'app-depreciation',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, CurrencyPipe, DatePipe, DecimalPipe],
  templateUrl: './depreciation.html',
  styleUrls: ['./depreciation.css']
})
export class DepreciationComponent implements OnInit {
  private depreciationService = inject(DepreciationService);
  private cdr = inject(ChangeDetectorRef);

  isLoading = true;
  summary: DepreciationSummary | null = null;
  assets: AssetDepreciation[] = [];
  filteredAssets: AssetDepreciation[] = [];
  categories: CategoryDepreciationSummary[] = [];

  // Filters & Search
  searchTerm = '';
  selectedCategoryId: number = 0;
  selectedStatusFilter: 'ALL' | 'ACTIVE' | 'DEP' = 'ALL';
  selectedYear: number = 0; // 0 means current date

  availableYears: { label: string; value: number }[] = [];

  // Pagination
  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [10, 20, 50, 100];

  // Schedule Modal State
  selectedSchedule: AssetDepreciationSchedule | null = null;
  isLoadingSchedule = false;
  isScheduleModalOpen = false;

  ngOnInit(): void {
    this.initYearOptions();
    this.loadDepreciationData();
  }

  initYearOptions(): void {
    const currentYear = new Date().getFullYear();
    this.availableYears = [
      { label: `Current Realtime (${currentYear})`, value: 0 },
      { label: `End of ${currentYear}`, value: currentYear },
      { label: `End of ${currentYear + 1} (Simulation)`, value: currentYear + 1 },
      { label: `End of ${currentYear + 2} (Simulation)`, value: currentYear + 2 },
      { label: `End of ${currentYear + 3} (Simulation)`, value: currentYear + 3 },
      { label: `End of ${currentYear + 5} (Simulation)`, value: currentYear + 5 }
    ];
  }

  loadDepreciationData(): void {
    this.isLoading = true;
    const filters: { categoryId?: number; targetYear?: number } = {};
    if (this.selectedCategoryId > 0) {
      filters.categoryId = this.selectedCategoryId;
    }
    if (this.selectedYear > 0) {
      filters.targetYear = this.selectedYear;
    }

    this.depreciationService.getDepreciationSummary(filters).subscribe({
      next: (data) => {
        this.summary = data;
        this.assets = data.assets || [];
        this.categories = data.categoryBreakdown || [];
        this.applyLocalFilters();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load depreciation data', err);
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onYearChange(): void {
    this.currentPage = 1;
    this.loadDepreciationData();
  }

  onCategoryFilterChange(): void {
    this.currentPage = 1;
    this.loadDepreciationData();
  }

  setStatusFilter(status: 'ALL' | 'ACTIVE' | 'DEP'): void {
    this.selectedStatusFilter = status;
    this.currentPage = 1;
    this.applyLocalFilters();
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.applyLocalFilters();
  }

  applyLocalFilters(): void {
    let result = [...this.assets];

    // Status filter
    if (this.selectedStatusFilter === 'ACTIVE') {
      result = result.filter(a => !a.isFullyDepreciated);
    } else if (this.selectedStatusFilter === 'DEP') {
      result = result.filter(a => a.isFullyDepreciated);
    }

    // Search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter(a =>
        a.assetCode.toLowerCase().includes(term) ||
        (a.productName && a.productName.toLowerCase().includes(term)) ||
        (a.categoryName && a.categoryName.toLowerCase().includes(term)) ||
        (a.serialNumber && a.serialNumber.toLowerCase().includes(term)) ||
        (a.divisionName && a.divisionName.toLowerCase().includes(term))
      );
    }

    this.filteredAssets = result;
    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }
  }

  // Pagination getters & methods
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredAssets.length / this.pageSize));
  }

  get paginatedAssets(): AssetDepreciation[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredAssets.slice(start, start + this.pageSize);
  }

  get startIndex(): number {
    return this.filteredAssets.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredAssets.length);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
  }

  openScheduleModal(asset: AssetDepreciation): void {
    this.isScheduleModalOpen = true;
    this.isLoadingSchedule = true;
    this.selectedSchedule = null;

    this.depreciationService.getAssetSchedule(asset.id).subscribe({
      next: (schedule) => {
        this.selectedSchedule = schedule;
        this.isLoadingSchedule = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load asset schedule', err);
        this.isLoadingSchedule = false;
        this.cdr.markForCheck();
      }
    });
  }

  closeScheduleModal(): void {
    this.isScheduleModalOpen = false;
    this.selectedSchedule = null;
  }

  exportToCsv(): void {
    if (!this.filteredAssets.length) return;

    const headers = [
      'Asset Code',
      'Product Name',
      'Category',
      'Acquisition Date',
      'Purchase Price',
      'Depreciation Rate (%)',
      'Age (Years)',
      'Annual Depreciation',
      'Accumulated Depreciation',
      'Current Book Value',
      'Status'
    ];

    const rows = this.filteredAssets.map(a => [
      `"${a.assetCode}"`,
      `"${a.productName || ''}"`,
      `"${a.categoryName || ''}"`,
      `"${new Date(a.assetDate).toLocaleDateString()}"`,
      a.purchaseValue.toFixed(2),
      `${a.depreciationRate}%`,
      a.ageInYears.toFixed(2),
      a.annualDepreciation.toFixed(2),
      a.accumulatedDepreciation.toFixed(2),
      a.currentValue.toFixed(2),
      `"${a.isFullyDepreciated ? 'Fully Depreciated (LKR 0)' : 'Active'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Asset_Depreciation_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  printDate = new Date();

  get selectedCategoryName(): string {
    if (!this.selectedCategoryId || Number(this.selectedCategoryId) === 0) return 'All Asset Categories';
    const cat = this.categories.find(c => c.categoryId === Number(this.selectedCategoryId));
    return cat ? `${cat.categoryName} (${cat.depreciationRate}% / yr)` : 'All Asset Categories';
  }

  printReport(): void {
    this.printDate = new Date();
    this.cdr.markForCheck();
    setTimeout(() => {
      window.print();
    }, 50);
  }
}
