import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { SupplierService } from '../../services/supplier.service';
import { Supplier, SupplierCategory, SupplierStatus } from '../../models/supplier.model';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './suppliers.html',
  styleUrls: ['./suppliers.css'],
})
export class SuppliersComponent implements OnInit {
  private supplierService = inject(SupplierService);
  private router = inject(Router);
  private toast = inject(ToastService);

  allSuppliers: Supplier[] = [];
  filteredSuppliers: Supplier[] = [];
  viewSuppliers: Supplier[] = [];

  loading = true;
  searchTerm = '';
  filterCategory = '';
  filterStatus = '';

  currentPage = 1;
  pageSize = 10;
  pageSizes = [5, 10, 25, 50];

  /* ── Computed stats ── */
  get totalSupplierCount(): number {
    return this.allSuppliers.length;
  }

  get activeCount(): number {
    return this.allSuppliers.filter((s) => s.status === 'Active').length;
  }

  get inactiveCount(): number {
    return this.allSuppliers.filter((s) => s.status === 'Inactive').length;
  }

  get pendingCount(): number {
    return this.allSuppliers.filter((s) => s.status === 'Pending').length;
  }

  get blacklistedCount(): number {
    return this.allSuppliers.filter((s) => s.status === 'Blacklisted').length;
  }

  get totalOrderValue(): number {
    return this.allSuppliers.reduce((sum, s) => sum + s.totalValue, 0);
  }

  get categories(): SupplierCategory[] {
    const cats = new Set(this.allSuppliers.map((s) => s.category));
    return Array.from(cats).sort() as SupplierCategory[];
  }

  get statuses(): SupplierStatus[] {
    return ['Active', 'Inactive', 'Pending', 'Blacklisted'];
  }

  get totalPages(): number {
    return Math.ceil(this.filteredSuppliers.length / this.pageSize) || 1;
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get showingFrom(): number {
    return this.filteredSuppliers.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get showingTo(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredSuppliers.length);
  }

  get selectedCount(): number {
    return this.viewSuppliers.filter((s) => s.selected).length;
  }

  get allSelected(): boolean {
    return this.viewSuppliers.length > 0 && this.viewSuppliers.every((s) => s.selected);
  }

  ngOnInit(): void {
    this.supplierService.getAll().subscribe({
      next: (data: Supplier[]) => {
        this.allSuppliers = data;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.toast.show('Failed to load suppliers', 'error');
        this.loading = false;
      },
    });
  }

  /* ── Filtering ── */
  applyFilters(): void {
    const term = this.searchTerm.toLowerCase().trim();

    this.filteredSuppliers = this.allSuppliers.filter((s) => {
      const matchesSearch =
        !term ||
        s.companyName.toLowerCase().includes(term) ||
        s.id.toLowerCase().includes(term) ||
        s.contactPerson.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term) ||
        s.city.toLowerCase().includes(term);

      const matchesCategory = !this.filterCategory || s.category === this.filterCategory;
      const matchesStatus = !this.filterStatus || s.status === this.filterStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    this.currentPage = 1;
    this.updateView();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filterCategory = '';
    this.filterStatus = '';
    this.applyFilters();
  }

  get hasActiveFilters(): boolean {
    return !!this.searchTerm || !!this.filterCategory || !!this.filterStatus;
  }

  /* ── Pagination ── */
  updateView(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.viewSuppliers = this.filteredSuppliers.slice(start, start + this.pageSize);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updateView();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.updateView();
  }

  /* ── Selection ── */
  toggleSelectAll(): void {
    const target = !this.allSelected;
    this.viewSuppliers.forEach((s) => (s.selected = target));
  }

  clearSelection(): void {
    this.allSuppliers.forEach((s) => (s.selected = false));
  }

  /* ── Actions ── */
  onRowClick(supplier: Supplier): void {
    this.toast.show(`Supplier details for ${supplier.companyName} — coming soon`, 'info');
  }

  onNewSupplier(): void {
    this.toast.show('Add supplier form — coming soon', 'info');
  }

  /* ── Helpers ── */
  formatCurrency(value: number): string {
    return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 0 });
  }

  getStatusClass(status: SupplierStatus): string {
    const map: Record<SupplierStatus, string> = {
      Active: 'active',
      Inactive: 'inactive',
      Pending: 'pending',
      Blacklisted: 'blacklisted',
    };
    return map[status] || '';
  }

  getCategoryIcon(category: SupplierCategory): string {
    const map: Record<string, string> = {
      'IT Equipment': 'computer',
      'Office Supplies': 'inventory_2',
      Furniture: 'chair',
      Networking: 'router',
      Software: 'code',
      Maintenance: 'build',
      Electronics: 'devices',
      General: 'category',
    };
    return map[category] || 'business';
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  getAvatarClass(id: string): string {
    const num = parseInt(id.replace('SUP-', ''), 10) || 0;
    const variants = ['teal', 'blue', 'purple', 'green', 'orange', 'indigo'];
    return variants[num % variants.length];
  }

  getRatingStars(_rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  isExpiringSoon(dateStr: string): boolean {
    const expiry = new Date(dateStr);
    const now = new Date();
    const diffMs = expiry.getTime() - now.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays > 0 && diffDays <= 90;
  }

  isExpired(dateStr: string): boolean {
    return new Date(dateStr) < new Date();
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}
