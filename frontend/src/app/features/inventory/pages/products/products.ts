import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './products.html',
  styleUrls: ['./products.css'],
})
export class ProductsComponent implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);
  private toast = inject(ToastService);

  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  viewProducts: Product[] = [];
  loading = true;

  search = '';
  filterCategory = '';
  filterManufacturer = '';
  pageSize = 10;
  currentPage = 1;
  totalPages = 1;
  allSelected = false;

  get totalProductCount(): number {
    return this.allProducts.length;
  }

  get totalAssetUnits(): number {
    return this.allProducts.reduce((sum, p) => sum + p.totalAssets, 0);
  }

  get totalAvailable(): number {
    return this.allProducts.reduce((sum, p) => sum + p.availableAssets, 0);
  }

  get lowStockCount(): number {
    return this.allProducts.filter((p) => p.availableAssets < p.minQuantity).length;
  }

  get outOfStockCount(): number {
    return this.allProducts.filter((p) => p.availableAssets === 0).length;
  }

  get totalCatalogValue(): number {
    return this.allProducts.reduce((sum, p) => sum + p.unitCost * p.totalAssets, 0);
  }

  get categories(): string[] {
    return [...new Set(this.allProducts.map((p) => p.category))].sort();
  }

  get manufacturers(): string[] {
    return [...new Set(this.allProducts.map((p) => p.manufacturer))].sort();
  }

  ngOnInit(): void {
    this.productService.getAll().subscribe({
      next: (data: Product[]) => {
        this.allProducts = data;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toast.error('Failed to load products');
      },
    });
  }

  applyFilters(): void {
    let result = this.allProducts.slice();

    if (this.search.trim()) {
      const q = this.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.manufacturer.toLowerCase().includes(q) ||
          p.modelNumber.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (this.filterCategory) {
      result = result.filter((p) => p.category === this.filterCategory);
    }

    if (this.filterManufacturer) {
      result = result.filter((p) => p.manufacturer === this.filterManufacturer);
    }

    this.filteredProducts = result;
    this.totalPages = Math.max(1, Math.ceil(result.length / this.pageSize));
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    this.updateView();
  }

  clearFilters(): void {
    this.search = '';
    this.filterCategory = '';
    this.filterManufacturer = '';
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

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
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

  formatCurrency(value: number): string {
    return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 0 });
  }

  getStockStatus(product: Product): 'healthy' | 'low' | 'out' {
    if (product.availableAssets === 0) return 'out';
    if (product.availableAssets < product.minQuantity) return 'low';
    return 'healthy';
  }

  getStockLabel(product: Product): string {
    const status = this.getStockStatus(product);
    if (status === 'out') return 'Out of Stock';
    if (status === 'low') return 'Low Stock';
    return 'In Stock';
  }

  getCategoryIcon(category: string): string {
    const map: Record<string, string> = {
      Laptops: 'laptop',
      'Mobile Devices': 'smartphone',
      Tablets: 'tablet',
      Monitors: 'desktop_windows',
      Accessories: 'keyboard',
      Networking: 'lan',
      Printers: 'print',
      Desktops: 'computer',
    };
    return map[category] || 'devices';
  }

  getThumbClass(category: string): string {
    const map: Record<string, string> = {
      Laptops: 'thumb laptop',
      'Mobile Devices': 'thumb phone',
      Tablets: 'thumb tablet',
      Monitors: 'thumb monitor',
      Accessories: 'thumb accessory',
      Networking: 'thumb network',
      Printers: 'thumb printer',
      Desktops: 'thumb desktop',
    };
    return map[category] || 'thumb laptop';
  }

  formatEol(months: number): string {
    if (months >= 12) {
      const years = Math.floor(months / 12);
      const rem = months % 12;
      return rem > 0 ? `${years}y ${rem}m` : `${years}y`;
    }
    return `${months}m`;
  }

  onRowClick(product: Product): void {
    this.toast.info(`Product ${product.name} selected`);
  }

  onNewProduct(): void {
    this.toast.info('New product form — coming soon');
  }

  private updateView(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.viewProducts = this.filteredProducts.slice(start, start + this.pageSize);
    this.allSelected = this.viewProducts.length > 0 && this.viewProducts.every((p) => p.selected);
  }
}
