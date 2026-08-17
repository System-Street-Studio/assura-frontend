import { Component, OnInit, inject, ChangeDetectorRef, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AssetService } from '../../services/asset.service';
import { CategoryService } from '../../services/category.service';
import { AssetDetail } from '../../models/asset.model';
import { ToastService } from '../../../../shared/services/toast.service';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import QRCode from 'qrcode';

type ExportValue = string | number;

interface ExportColumn {
  header: string;
  value: (asset: AssetDetail) => ExportValue;
  /** Left unformatted so Excel treats it as a number rather than text. */
  numeric?: boolean;
}

@Component({
  selector: 'app-assets',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, PaginationComponent],
  templateUrl: './assets.html',
  styleUrls: ['./assets.css'],
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'closeExportMenu()',
  },
})
export class AssetsComponent implements OnInit {
  private assetService = inject(AssetService);
  private categoryService = inject(CategoryService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  private hostRef = inject<ElementRef<HTMLElement>>(ElementRef);

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

  // ── Export State ──
  showExportMenu = false;

  // ── Bulk QR Code Printing State ──
  showBulkQrModal = false;
  qrLoading = false;
  bulkQrItems: Array<{ asset: AssetDetail; qrUrl: string }> = [];
  printOptions = {
    showProduct: true,
    showCategory: true,
    showSerial: true,
    showDivision: true,
    columns: 2
  };

  get totalValue(): number {
    return this.allAssets.reduce((sum, a) => sum + (a.purchaseValue || 0), 0);
  }

  get selectedCount(): number {
    return this.allAssets.filter((a) => a.selected).length;
  }

  get selectedAssets(): AssetDetail[] {
    return this.allAssets.filter((a) => a.selected);
  }

  ngOnInit(): void {
    forkJoin({
      assets: this.assetService.getAll(),
      // Loaded independently of the asset list so every category in the system shows up
      // in the filter dropdown, not just the ones that already have an asset assigned to
      // them. Falls back to [] so a failure here doesn't block the assets grid from loading.
      categories: this.categoryService.getAll().pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ assets, categories }) => {
        this.allAssets = assets || [];
        // Precompute counts
        const counts: Record<string, number> = { InUse: 0, InStore: 0, UnderMaintenance: 0, Discarded: 0, Transferred: 0, Lost: 0 };
        this.allAssets.forEach(a => {
          if (a.status) counts[a.status] = (counts[a.status] || 0) + 1;
        });
        this.statusCounts = counts;

        // Union the full category master list with any names already on assets — a
        // defensive fallback in case an asset references a category outside that list.
        const assetCategoryNames = this.allAssets.map(a => a.categoryName).filter(Boolean) as string[];
        const categoryNames = (categories || []).map(c => c.name).filter(Boolean);
        this.categories = [...new Set([...categoryNames, ...assetCategoryNames])].sort((a, b) => a.localeCompare(b));

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

    // 2. Status Filter - Robust comparison
    if (this.filterStatus) {
      filtered = filtered.filter((a) => {
        if (!a.status && a.status !== 0) return false;
        const aStatus = a.status.toString().toLowerCase();
        const fStatus = this.filterStatus.toLowerCase();
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

  onStatusCardClick(status: string): void {
    if (this.filterStatus === status) {
      this.filterStatus = '';
    } else {
      this.filterStatus = status;
      this.filterCategory = '';
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

  selectAllFiltered(): void {
    this.filteredAssets.forEach((a) => (a.selected = true));
    this.allSelected = true;
    this.cdr.detectChanges();
    this.toast.info(`Selected all ${this.filteredAssets.length} filtered assets`);
  }

  clearSelection(): void {
    this.allAssets.forEach((a) => (a.selected = false));
    this.allSelected = false;
    this.cdr.detectChanges();
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
    if (value === undefined || value === null) return '—';
    return 'LKR ' + Math.round(value).toLocaleString('en-US');
  }

  /**
   * Digits only, no "LKR" prefix. Used by the Total Value summary card, whose title
   * already carries the currency ("Total Value (LKR)") — the fixed-width stat card has
   * no room for the prefix on top of the number without clipping.
   */
  formatNumber(value: number | undefined): string {
    if (value === undefined || value === null) return '—';
    return Math.round(value).toLocaleString('en-US');
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

  // ── Bulk QR Code Operations ──
  async openBulkQrModal(): Promise<void> {
    const selected = this.selectedAssets;
    if (!selected.length) {
      this.toast.warning('Please select at least one asset to print QR codes.');
      return;
    }

    this.showBulkQrModal = true;
    this.qrLoading = true;
    this.bulkQrItems = [];
    this.cdr.detectChanges();

    const items: Array<{ asset: AssetDetail; qrUrl: string }> = [];
    for (const asset of selected) {
      let qrUrl = '';
      if (asset.qrCode && asset.qrCode.trim().length > 10) {
        qrUrl = asset.qrCode.startsWith('data:image') ? asset.qrCode : `data:image/png;base64,${asset.qrCode}`;
      } else {
        try {
          qrUrl = await QRCode.toDataURL(asset.assetCode || `AST-${asset.id}`, {
            width: 140,
            margin: 1,
            color: { dark: '#0f172a', light: '#ffffff' }
          });
        } catch {
          qrUrl = '';
        }
      }
      items.push({ asset, qrUrl });
    }

    this.bulkQrItems = items;
    this.qrLoading = false;
    this.cdr.detectChanges();
  }

  closeBulkQrModal(): void {
    this.showBulkQrModal = false;
  }

  printBulkQr(): void {
    window.print();
  }

  // ── Export (CSV / Excel / PDF) ──

  /**
   * Full asset detail projected for export. Kept as one definition so CSV, Excel and
   * PDF always carry the same columns in the same order.
   */
  private readonly exportColumns: ExportColumn[] = [
    { header: 'Asset Code', value: (a) => a.assetCode || '' },
    { header: 'Asset Tag', value: (a) => a.assetTag || '' },
    { header: 'Product', value: (a) => a.productName || '' },
    { header: 'Category', value: (a) => a.categoryName || '' },
    { header: 'Status', value: (a) => this.getStatusLabel(a.status) },
    { header: 'Serial Number', value: (a) => a.serialNumber || '' },
    { header: 'Assigned To', value: (a) => a.assignedUserName || '' },
    { header: 'Division', value: (a) => a.divisionName || '' },
    { header: 'Supplier', value: (a) => a.supplierName || '' },
    { header: 'Purchase Value (LKR)', value: (a) => a.purchaseValue || 0, numeric: true },
    { header: 'Asset Date', value: (a) => this.formatExportDate(a.assetDate) },
    { header: 'Warranty', value: (a) => a.warranty || '' },
    { header: 'Last Verified', value: (a) => this.formatExportDate(a.lastVerifiedAt) },
    { header: 'Verified By', value: (a) => a.lastVerifiedByName || '' },
    { header: 'Notes', value: (a) => a.notes || '' },
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

  /** Exports the selected assets, or every asset matching the current filters if none are selected. */
  exportAssets(format: 'csv' | 'excel' | 'pdf'): void {
    this.showExportMenu = false;

    const assetsToExport = this.selectedCount > 0 ? this.selectedAssets : this.filteredAssets;
    if (!assetsToExport.length) {
      this.toast.warning('No assets to export');
      return;
    }

    const headers = this.exportColumns.map((c) => c.header);
    const rows = assetsToExport.map((a) => this.exportColumns.map((c) => c.value(a)));
    const filename = `Assura_Assets_${new Date().toISOString().slice(0, 10)}`;

    switch (format) {
      case 'csv':
        this.downloadCsv(headers, rows, filename);
        this.toast.success(`Exported ${assetsToExport.length} asset(s) to CSV`);
        break;
      case 'excel':
        this.downloadExcel(headers, rows, filename);
        this.toast.success(`Exported ${assetsToExport.length} asset(s) to Excel`);
        break;
      case 'pdf':
        this.downloadPdf(headers, rows, assetsToExport);
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
          r
            .map((v, i) => {
              // Force text on everything but the money column so serials and codes
              // keep their leading zeros instead of being coerced to numbers.
              const numberFormat = this.exportColumns[i].numeric ? '' : "mso-number-format:'\\@';";
              return `<td style="padding:6px;border:1px solid #e2e8f0;${numberFormat}">${this.escapeHtml(v)}</td>`;
            })
            .join('') +
          '</tr>'
      )
      .join('');

    const excelContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head><meta charset="UTF-8">
      <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
      <x:Name>Assets</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
      </x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
      </head><body><table>
        <thead><tr>${head}</tr></thead>
        <tbody>${body}</tbody>
      </table></body></html>`;

    this.triggerDownload(excelContent, `${filename}.xls`, 'application/vnd.ms-excel');
  }

  private downloadPdf(headers: string[], rows: ExportValue[][], assets: AssetDetail[]): void {
    const totalValue = assets.reduce((sum, a) => sum + (a.purchaseValue || 0), 0);
    const generatedOn = new Date().toLocaleString();

    const headerCells = headers.map((h) => `<th>${this.escapeHtml(h)}</th>`).join('');
    const bodyRows = rows
      .map(
        (r, i) =>
          `<tr><td class="idx">${i + 1}</td>` +
          r
            .map((v, c) => {
              const value = this.exportColumns[c].numeric
                ? this.formatCurrency(Number(v))
                : this.escapeHtml(v);
              return `<td${this.exportColumns[c].numeric ? ' class="num"' : ''}>${value}</td>`;
            })
            .join('') +
          '</tr>'
      )
      .join('');

    const html = `<!doctype html>
    <html><head><meta charset="UTF-8"><title>Assura — Asset Register</title>
    <style>
      @page { size: A4 landscape; margin: 10mm; }
      * { box-sizing: border-box; }
      body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; margin: 0; padding: 0; }
      h1 { color: #4f46e5; font-size: 20px; margin: 0 0 4px; }
      .subtitle { color: #475569; font-size: 11px; margin: 0 0 2px; }
      .meta { color: #64748b; font-size: 10px; margin: 0 0 14px; }
      table { width: 100%; border-collapse: collapse; font-size: 8.5px; table-layout: fixed; }
      th { background: #4f46e5; color: #ffffff; padding: 6px 4px; text-align: left; border: 1px solid #4338ca; }
      td { padding: 5px 4px; border: 1px solid #e2e8f0; vertical-align: top; word-wrap: break-word; overflow-wrap: anywhere; }
      tr:nth-child(even) td { background: #f8fafc; }
      td.num, th.num { text-align: right; }
      td.idx { color: #94a3b8; text-align: right; width: 26px; }
      tfoot td { font-weight: 700; background: #eef2ff; border-top: 2px solid #4f46e5; }
      .footer { margin-top: 14px; font-size: 9px; color: #94a3b8; text-align: center; }
      thead { display: table-header-group; }
      tr { page-break-inside: avoid; }
    </style></head><body>
      <h1>Asset Register</h1>
      <p class="subtitle">${this.escapeHtml(this.exportScopeLabel)}</p>
      <p class="meta">Generated on ${this.escapeHtml(generatedOn)}</p>
      <table>
        <thead><tr><th class="idx">#</th>${headerCells}</tr></thead>
        <tbody>${bodyRows}</tbody>
        <tfoot><tr>
          <td colspan="10">Total (${assets.length} asset(s))</td>
          <td class="num">${this.formatCurrency(totalValue)}</td>
          <td colspan="5"></td>
        </tr></tfoot>
      </table>
      <div class="footer">© ${new Date().getFullYear()} Assura — Fixed Asset Management System</div>
    </body></html>`;

    // Printed from a detached iframe rather than window.open so popup blockers do not
    // swallow it, and so this page's own QR-label @media print rules do not apply.
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
    // Fallback in case the browser never fires onafterprint (e.g. print dialog dismissed).
    setTimeout(cleanup, 60000);

    setTimeout(() => {
      frameWindow.focus();
      frameWindow.print();
    }, 300);

    this.toast.info(`Preparing ${assets.length} asset(s) — choose "Save as PDF" in the print dialog`);
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
      return `${this.selectedCount} selected asset(s)`;
    }
    const parts = [`${this.filteredAssets.length} of ${this.allAssets.length} asset(s)`];
    if (this.filterStatus) parts.push(`Status: ${this.getStatusLabel(this.filterStatus)}`);
    if (this.filterCategory) parts.push(`Category: ${this.filterCategory}`);
    if (this.search.trim()) parts.push(`Search: "${this.search.trim()}"`);
    return parts.join('  •  ');
  }

  private formatExportDate(value: string | undefined): string {
    if (!value) return '';
    const date = new Date(value);
    // ISO date keeps Excel sorting correct; fall back to the raw string if unparseable.
    return isNaN(date.getTime()) ? value : date.toISOString().slice(0, 10);
  }

  private escapeHtml(value: ExportValue): string {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
