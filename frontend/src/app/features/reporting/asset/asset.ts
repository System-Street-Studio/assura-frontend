import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Subject, debounceTime, distinctUntilChanged, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ReportingService } from '../services/reporting.service';
import { AssetService } from '../../inventory/services/asset.service';
import { AssetDetail, AssetTransferHistoryEntry, CheckoutRecordDto } from '../../inventory/models/asset.model';
import { ToastService } from '../../../shared/services/toast.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';

@Component({
  selector: 'app-reporting-asset',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, PaginationComponent],
  templateUrl: './asset.html',
  styleUrls: ['./asset.css'],
})
export class ReportingAssetComponent implements OnInit {
  private reportingService = inject(ReportingService);
  private assetService = inject(AssetService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  private searchInput$ = new Subject<string>();

  Math = Math;

  readonly assets = signal<any[]>([]);
  readonly totalCount = signal(0);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly searchTerm = signal('');

  // Modal / User History State
  showModal = false;
  modalLoading = false;
  activeModalTab: 'checkout' | 'transfers' = 'checkout';
  selectedAssetRow: any = null;
  selectedAssetDetail: AssetDetail | null = null;
  checkoutHistory: CheckoutRecordDto[] = [];
  transferHistory: AssetTransferHistoryEntry[] = [];
  verifying = false;

  totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize()) || 1);
  pageNumbers = computed(() => {
    const pages = [];
    for (let i = 1; i <= this.totalPages(); i++) {
      pages.push(i);
    }
    return pages;
  });

  ngOnInit(): void {
    this.loadAssets();

    this.searchInput$.pipe(debounceTime(300), distinctUntilChanged()).subscribe(term => {
      this.searchTerm.set(term);
      this.currentPage.set(1);
      this.loadAssets();
    });
  }

  onSearchInput(term: string): void {
    this.searchInput$.next(term);
  }

  loadAssets(): void {
    this.reportingService.getAssets(this.currentPage(), this.pageSize(), this.searchTerm() || undefined).subscribe({
      next: data => {
        this.assets.set(data.assets);
        this.totalCount.set(data.totalCount);
      },
      error: err => console.error('Error loading assets:', err),
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadAssets();
  }

  openAssetUserHistory(row: any): void {
    this.selectedAssetRow = row;
    this.showModal = true;
    this.modalLoading = true;
    this.activeModalTab = 'checkout';
    this.selectedAssetDetail = null;
    this.checkoutHistory = [];
    this.transferHistory = [];
    this.cdr.detectChanges();

    const assetId = row.id;

    forkJoin({
      detail: this.assetService.getAssetById(assetId).pipe(catchError(() => of(null))),
      checkouts: this.assetService.getCheckoutRecords(assetId).pipe(catchError(() => of([]))),
      transfers: this.assetService.getTransferHistory(assetId).pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ detail, checkouts, transfers }) => {
        this.selectedAssetDetail = detail;
        this.checkoutHistory = checkouts;
        this.transferHistory = transfers;
        this.modalLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.modalLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedAssetRow = null;
    this.selectedAssetDetail = null;
    this.cdr.detectChanges();
  }

  verifyAsset(id: number): void {
    if (this.verifying) return;
    this.verifying = true;
    this.reportingService.verifyAsset(id).subscribe({
      next: () => {
        this.toast.success('Asset verified successfully');
        this.verifying = false;
        if (this.selectedAssetRow) {
          this.selectedAssetRow.status = 'Verified';
        }
        this.loadAssets();
        this.cdr.detectChanges();
      },
      error: () => {
        this.toast.error('Failed to verify asset');
        this.verifying = false;
        this.cdr.detectChanges();
      }
    });
  }
}

