import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ReportingService } from '../services/reporting.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-reporting-asset',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './asset.html',
  styleUrls: ['./asset.css'],
})
export class ReportingAssetComponent implements OnInit {
  private reportingService = inject(ReportingService);
  private authService = inject(AuthService);

  Math = Math;

  readonly assets = signal<any[]>([]);
  readonly selectedCount = signal(0);
  readonly totalCount = signal(0);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

  totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize()) || 1);

  isAuditor = computed(() => this.authService.hasRole('Auditor') || this.authService.hasRole('Admin'));

  ngOnInit(): void {
    this.loadAssets();
  }

  loadAssets(): void {
    this.reportingService.getAssets(this.currentPage(), this.pageSize()).subscribe(data => {
      this.assets.set(data.assets);
      this.selectedCount.set(data.selectedCount);
      this.totalCount.set(data.totalCount);
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadAssets();
  }

  verifyAsset(asset: any): void {
    if (!asset.id) return;

    this.reportingService.verifyAsset(asset.id).subscribe({
      next: () => {
        alert(`Asset ${asset.assetId} verified successfully.`);
        this.loadAssets();
      },
      error: (err) => {
        console.error('Error verifying asset:', err);
        alert('Failed to verify asset.');
      }
    });
  }

  toggleSelect(asset: any): void {
    asset.selected = !asset.selected;
    this.updateSelectedCount();
  }

  private updateSelectedCount(): void {
    this.selectedCount.set(this.assets().filter(a => a.selected).length);
  }
}

