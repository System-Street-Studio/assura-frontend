import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ReportingService } from '../services/reporting.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';

@Component({
  selector: 'app-reporting-asset',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './asset.html',
  styleUrls: ['./asset.css'],
})
export class ReportingAssetComponent implements OnInit {
  private reportingService = inject(ReportingService);
  private searchInput$ = new Subject<string>();

  Math = Math;

  readonly assets = signal<any[]>([]);
  readonly totalCount = signal(0);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly searchTerm = signal('');

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
}

