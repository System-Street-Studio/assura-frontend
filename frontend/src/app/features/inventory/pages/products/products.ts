import { Component, OnInit, inject, ChangeDetectorRef, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { ToastService } from '../../../../shared/services/toast.service';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';

type ExportValue = string | number;

interface ExportColumn {
  header: string;
  value: (product: Product) => ExportValue;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, PaginationComponent, RouterLink],
  templateUrl: './products.html',
  styleUrls: ['./products.css'],
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'closeExportMenu()',
  },
})
export class ProductsComponent implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  private hostRef = inject<ElementRef<HTMLElement>>(ElementRef);

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

  showExportMenu = false;
  showDeleteConfirm = false;
  deleting = false;

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

  // ── Delete (selected rows) ──

  onDeleteClick(): void {
    if (this.selectedCount === 0) return;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
  }

  confirmDelete(): void {
    const toDelete = this.allProducts.filter((p) => p.selected);
    if (!toDelete.length) {
      this.showDeleteConfirm = false;
      return;
    }

    this.deleting = true;
    forkJoin(
      toDelete.map((p) =>
        this.productService.delete(p.id).pipe(catchError(() => of(null)))
      )
    ).subscribe((results) => {
      const failedCount = results.filter((r) => r === null).length;
      const deletedIds = new Set(
        toDelete.filter((_, i) => results[i] !== null).map((p) => p.id)
      );

      this.allProducts = this.allProducts.filter((p) => !deletedIds.has(p.id));
      this.applyFilters();

      this.deleting = false;
      this.showDeleteConfirm = false;

      if (deletedIds.size > 0) {
        this.toast.success(`Deleted ${deletedIds.size} product(s)`);
      }
      if (failedCount > 0) {
        this.toast.error(`Failed to delete ${failedCount} product(s) — they may still be in use.`);
      }
      this.cdr.detectChanges();
    });
  }

  // ── Export (CSV / Excel / PDF) ──

  private readonly exportColumns: ExportColumn[] = [
    { header: 'Product ID', value: (p) => p.id },
    { header: 'Name', value: (p) => p.name || '' },
    { header: 'Manufacturer', value: (p) => p.manufacturer || '' },
    { header: 'Model Number', value: (p) => p.modelNumber || '' },
    { header: 'Description', value: (p) => p.description || '' },
  ];

  toggleExportMenu(): void {
    this.showExportMenu = !this.showExportMenu;
  }

  closeExportMenu(): void {
    if (this.showExportMenu) {
      this.showExportMenu = false;
      this.cdr.detectChanges();
    }
  }

  /** Closes the export dropdown on any click landing outside it. */
  onDocumentClick(ev: MouseEvent): void {
    if (!this.showExportMenu) return;
    const wrapper = this.hostRef.nativeElement.querySelector('.export-wrapper');
    if (wrapper && ev.target instanceof Node && wrapper.contains(ev.target)) return;
    this.closeExportMenu();
  }

  /** Exports the selected products, or every product matching the current filters if none are selected. */
  exportProducts(format: 'csv' | 'excel' | 'pdf'): void {
    this.showExportMenu = false;

    const productsToExport = this.selectedCount > 0 ? this.allProducts.filter((p) => p.selected) : this.filteredProducts;
    if (!productsToExport.length) {
      this.toast.warning('No products to export');
      return;
    }

    const headers = this.exportColumns.map((c) => c.header);
    const rows = productsToExport.map((p) => this.exportColumns.map((c) => c.value(p)));
    const filename = `Assura_Products_${new Date().toISOString().slice(0, 10)}`;

    switch (format) {
      case 'csv':
        this.downloadCsv(headers, rows, filename);
        this.toast.success(`Exported ${productsToExport.length} product(s) to CSV`);
        break;
      case 'excel':
        this.downloadExcel(headers, rows, filename);
        this.toast.success(`Exported ${productsToExport.length} product(s) to Excel`);
        break;
      case 'pdf':
        this.downloadPdf(headers, rows, productsToExport);
        break;
    }
  }

  private downloadCsv(headers: string[], rows: ExportValue[][], filename: string): void {
    const cell = (v: ExportValue) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = [headers.map(cell).join(','), ...rows.map((r) => r.map(cell).join(','))].join('\r\n');
    // Leading BOM so Excel opens the file as UTF-8 instead of ANSI.
    this.triggerDownload('﻿' + csv, `${filename}.csv`, 'text/csv');
  }

  private downloadExcel(headers: string[], rows: ExportValue[][], filename: string): void {
    const head = headers
      .map(
        (h) =>
          `<th style="background:#4f46e5;color:#ffffff;padding:8px;font-weight:bold;border:1px solid #cbd5e1;">${this.escapeHtml(h)}</th>`
      )
      .join('');

    const body = rows
      .map(
        (r) =>
          '<tr>' +
          r.map((v) => `<td style="padding:6px;border:1px solid #e2e8f0;mso-number-format:'\\@';">${this.escapeHtml(v)}</td>`).join('') +
          '</tr>'
      )
      .join('');

    const excelContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head><meta charset="UTF-8">
      <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
      <x:Name>Products</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
      </x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
      </head><body><table>
        <thead><tr>${head}</tr></thead>
        <tbody>${body}</tbody>
      </table></body></html>`;

    this.triggerDownload(excelContent, `${filename}.xls`, 'application/vnd.ms-excel');
  }

  private downloadPdf(headers: string[], rows: ExportValue[][], products: Product[]): void {
    const generatedOn = new Date().toLocaleString();
    const headerCells = headers.map((h) => `<th>${this.escapeHtml(h)}</th>`).join('');
    const bodyRows = rows
      .map(
        (r, i) =>
          `<tr><td class="idx">${i + 1}</td>` + r.map((v) => `<td>${this.escapeHtml(v)}</td>`).join('') + '</tr>'
      )
      .join('');

    const html = `<!doctype html>
    <html><head><meta charset="UTF-8"><title>Assura — Product Catalog</title>
    <style>
      @page { size: A4 landscape; margin: 10mm; }
      * { box-sizing: border-box; }
      body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; margin: 0; padding: 0; }
      h1 { color: #4f46e5; font-size: 20px; margin: 0 0 4px; }
      .subtitle { color: #475569; font-size: 11px; margin: 0 0 2px; }
      .meta { color: #64748b; font-size: 10px; margin: 0 0 14px; }
      table { width: 100%; border-collapse: collapse; font-size: 9px; table-layout: fixed; }
      th { background: #4f46e5; color: #ffffff; padding: 6px 4px; text-align: left; border: 1px solid #4338ca; }
      td { padding: 5px 4px; border: 1px solid #e2e8f0; vertical-align: top; word-wrap: break-word; overflow-wrap: anywhere; }
      tr:nth-child(even) td { background: #f8fafc; }
      td.idx { color: #94a3b8; text-align: right; width: 26px; }
      .footer { margin-top: 14px; font-size: 9px; color: #94a3b8; text-align: center; }
      thead { display: table-header-group; }
      tr { page-break-inside: avoid; }
    </style></head><body>
      <h1>Product Catalog</h1>
      <p class="subtitle">${this.escapeHtml(this.exportScopeLabel)}</p>
      <p class="meta">Generated on ${this.escapeHtml(generatedOn)}</p>
      <table>
        <thead><tr><th class="idx">#</th>${headerCells}</tr></thead>
        <tbody>${bodyRows}</tbody>
      </table>
      <div class="footer">© ${new Date().getFullYear()} Assura — Fixed Asset Management System</div>
    </body></html>`;

    // Printed from a detached iframe rather than window.open so popup blockers do not swallow it.
    const frame = document.createElement('iframe');
    frame.setAttribute('aria-hidden', 'true');
    frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
    document.body.appendChild(frame);

    const frameWindow = frame.contentWindow;
    if (!frameWindow) {
      frame.remove();
      this.toast.error('Unable to open the PDF preview');
      return;
    }

    frameWindow.document.open();
    frameWindow.document.write(html);
    frameWindow.document.close();

    let cleanedUp = false;
    const cleanup = () => {
      if (cleanedUp) return;
      cleanedUp = true;
      frame.remove();
    };
    frameWindow.onafterprint = cleanup;
    setTimeout(cleanup, 60000);

    setTimeout(() => {
      frameWindow.focus();
      frameWindow.print();
    }, 300);

    this.toast.info(`Preparing ${products.length} product(s) — choose "Save as PDF" in the print dialog`);
  }

  private triggerDownload(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /** Describes what the export actually contains, for the PDF sub-heading. */
  private get exportScopeLabel(): string {
    if (this.selectedCount > 0) {
      return `${this.selectedCount} selected product(s)`;
    }
    const parts = [`${this.filteredProducts.length} of ${this.allProducts.length} product(s)`];
    if (this.search.trim()) parts.push(`Search: "${this.search.trim()}"`);
    return parts.join('  •  ');
  }

  private escapeHtml(value: ExportValue): string {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
