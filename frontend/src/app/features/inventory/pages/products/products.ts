import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { ToastService } from '../../../../shared/services/toast.service';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, PaginationComponent, RouterLink],
  templateUrl: './products.html',
  styleUrls: ['./products.css'],
})
export class ProductsComponent implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  viewProducts: Product[] = [];
  loading = true;

  search = '';
  pageSize = 10;
  currentPage = 1;
  totalPages = 1;
  allSelected = false;
  pageNumbers: number[] = [1];

  ngOnInit(): void {
    this.productService.getAll().subscribe({
      next: (data: Product[]) => {
        this.allProducts = data || [];
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.toast.error('Failed to load products');
        this.cdr.detectChanges();
      },
    });
  }

  applyFilters(): void {
    let result = this.allProducts.slice();

    if (this.search.trim()) {
      const q = this.search.toLowerCase();
      result = result.filter(
        (p) =>
          (p.name || '').toLowerCase().includes(q) ||
          String(p.id || '').toLowerCase().includes(q) ||
          (p.manufacturer || '').toLowerCase().includes(q) ||
          (p.modelNumber || '').toLowerCase().includes(q)
      );
    }

    this.filteredProducts = result;
    this.totalPages = Math.max(1, Math.ceil(result.length / this.pageSize));
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    this.pageNumbers = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.updateView();
  }

  clearFilters(): void {
    this.search = '';
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
    return this.filteredProducts.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get showingTo(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredProducts.length);
  }

  toggleSelectAll(ev: Event): void {
    this.allSelected = (ev.target as HTMLInputElement).checked;
    this.viewProducts.forEach((p) => (p.selected = this.allSelected));
  }

  onRowSelect(product: Product, ev: Event): void {
    product.selected = (ev.target as HTMLInputElement).checked;
    this.allSelected = this.viewProducts.every((p) => p.selected);
  }

  get selectedCount(): number {
    return this.allProducts.filter((p) => p.selected).length;
  }

  onRowClick(product: Product): void {
    this.router.navigate(['/inventory/products', product.id, 'edit']);
  }

  onNewProduct(): void {
    this.router.navigate(['/inventory/products/new']);
  }

  private updateView(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.viewProducts = this.filteredProducts.slice(start, start + this.pageSize);
    this.allSelected = this.viewProducts.length > 0 && this.viewProducts.every((p) => p.selected);
  }
}
