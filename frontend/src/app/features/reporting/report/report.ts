import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReportingService } from '../services/reporting.service';

@Component({
  selector: 'app-reporting-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report.html',
  styleUrls: ['./report.css'],
})
export class ReportingReportComponent implements OnInit {
  private reportingService = inject(ReportingService);

  readonly summaries = signal<any[]>([]);
  readonly reportItems = signal<any[]>([]);
  readonly insights = signal<any[]>([]);

  selectedFormat = 'CSV';
  selectedDateRange = 'This month';
  isExporting = false;

  ngOnInit(): void {
    this.reportingService.getReports().subscribe(data => {
      this.summaries.set(data.summaries);
      this.reportItems.set(data.reportItems);
      this.insights.set(data.insights);
    });
  }

  exportTable(): void {
    const items = this.reportItems();
    if (!items.length) return;

    switch (this.selectedFormat) {
      case 'CSV':
        this.downloadCSV(items);
        break;
      case 'Excel':
        this.downloadExcel(items);
        break;
      case 'PDF':
        this.downloadPDF(items);
        break;
    }
  }

  downloadQuickExport(): void {
    this.isExporting = true;
    // Use setTimeout to show loading state briefly
    setTimeout(() => {
      this.exportTable();
      this.isExporting = false;
    }, 300);
  }

  private downloadCSV(items: any[]): void {
    const headers = ['Report ID', 'Title', 'Owner', 'Type', 'Period', 'Generated', 'Status', 'Size'];
    const rows = items.map(item => [
      item.id, item.title, item.owner, item.type, item.period, item.generated, item.status, item.size
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map((field: string) => `"${(field || '').replace(/"/g, '""')}"`).join(',') + '\n';
    });

    this.triggerDownload(csvContent, 'asset-report.csv', 'text/csv');
  }

  private downloadExcel(items: any[]): void {
    // Generate an HTML table that Excel can open
    const headers = ['Report ID', 'Title', 'Owner', 'Type', 'Period', 'Generated', 'Status', 'Size'];

    let table = '<table>';
    table += '<thead><tr>' + headers.map(h => `<th style="background:#0b6c78;color:white;padding:8px;font-weight:bold;">${h}</th>`).join('') + '</tr></thead>';
    table += '<tbody>';
    items.forEach(item => {
      table += '<tr>';
      table += `<td style="padding:6px;border:1px solid #ddd;">${item.id}</td>`;
      table += `<td style="padding:6px;border:1px solid #ddd;">${item.title}</td>`;
      table += `<td style="padding:6px;border:1px solid #ddd;">${item.owner}</td>`;
      table += `<td style="padding:6px;border:1px solid #ddd;">${item.type}</td>`;
      table += `<td style="padding:6px;border:1px solid #ddd;">${item.period}</td>`;
      table += `<td style="padding:6px;border:1px solid #ddd;">${item.generated}</td>`;
      table += `<td style="padding:6px;border:1px solid #ddd;">${item.status}</td>`;
      table += `<td style="padding:6px;border:1px solid #ddd;">${item.size}</td>`;
      table += '</tr>';
    });
    table += '</tbody></table>';

    const excelContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head><meta charset="UTF-8">
      <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
      <x:Name>Reports</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
      </x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
      </head><body>${table}</body></html>`;

    this.triggerDownload(excelContent, 'asset-report.xls', 'application/vnd.ms-excel');
  }

  private downloadPDF(items: any[]): void {
    const headers = ['Report ID', 'Title', 'Owner', 'Type', 'Period', 'Generated', 'Status', 'Size'];
    const now = new Date().toLocaleDateString();

    let tableRows = '';
    items.forEach(item => {
      tableRows += `<tr>
        <td>${item.id}</td><td>${item.title}</td><td>${item.owner}</td><td>${item.type}</td>
        <td>${item.period}</td><td>${item.generated}</td><td>${item.status}</td><td>${item.size}</td>
      </tr>`;
    });

    const html = `
    <html><head><title>Assura Report Export</title>
    <style>
      body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1e293b; }
      h1 { color: #0b6c78; font-size: 24px; margin-bottom: 4px; }
      p.subtitle { color: #64748b; margin-bottom: 24px; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      th { background: #0b6c78; color: white; padding: 10px 8px; text-align: left; }
      td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
      tr:nth-child(even) { background: #f8fafc; }
      .footer { margin-top: 32px; font-size: 11px; color: #94a3b8; text-align: center; }
    </style></head><body>
      <h1>Assura — Asset Report</h1>
      <p class="subtitle">Generated on ${now}</p>
      <table>
        <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
      <div class="footer">© ${new Date().getFullYear()} Assura. All rights reserved.</div>
    </body></html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  }

  private triggerDownload(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType + ';charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }
}
