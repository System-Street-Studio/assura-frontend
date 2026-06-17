import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
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

  readonly searchTerm = signal('');
  
  readonly filteredReports = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.reportItems();
    return this.reportItems().filter(r => 
      r.id?.toLowerCase().includes(term) ||
      r.title?.toLowerCase().includes(term) ||
      r.owner?.toLowerCase().includes(term) ||
      r.type?.toLowerCase().includes(term)
    );
  });

  selectedFormat = 'CSV';
  selectedDateRange = 'this-month';
  selectedExportType = 'Audit';
  isExporting = false;
  
  showScheduleModal = false;
  showNewReportModal = false;
  newReportTitle = '';
  newReportType = 'Audit';

  ngOnInit(): void {
    this.reportingService.getReports().subscribe(data => {
      this.summaries.set(data.summaries);
      this.reportItems.set(data.reportItems);
      this.insights.set(data.insights);
    });
  }

  exportTable(): void {
    const items = this.filteredReports();
    if (!items.length) return;

    switch (this.selectedFormat) {
      case 'CSV':
        this.downloadCSV(items, true, 'Report_Library');
        break;
      case 'Excel':
        this.downloadExcel(items, true, 'Report_Library');
        break;
      case 'PDF':
        this.downloadPDF(items, true, 'Report Library');
        break;
    }
  }

  downloadQuickExport(): void {
    this.isExporting = true;
    
    // Calculate dates based on selectedDateRange
    let startDate: string | undefined;
    let endDate: string | undefined;
    const now = new Date();
    
    if (this.selectedDateRange === 'this-month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
    } else if (this.selectedDateRange === 'last-month') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
      endDate = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();
    } else if (this.selectedDateRange === 'this-year') {
      startDate = new Date(now.getFullYear(), 0, 1).toISOString();
      endDate = new Date(now.getFullYear(), 11, 31).toISOString();
    }

    this.reportingService.getReportData(this.selectedExportType, startDate, endDate).subscribe({
      next: (data) => {
        if (!data || data.length === 0) {
          alert('No data available for the selected filters.');
          this.isExporting = false;
          return;
        }

        const safeTitle = `${this.selectedExportType}_Report_${this.selectedDateRange}`;
        switch(this.selectedFormat) {
          case 'CSV':
            this.downloadCSV(data, false, safeTitle);
            break;
          case 'Excel':
            this.downloadExcel(data, false, safeTitle);
            break;
          case 'PDF':
            this.downloadPDF(data, false, safeTitle);
            break;
        }
        this.isExporting = false;
      },
      error: (err) => {
        console.error('Quick export failed:', err);
        alert('Failed to generate custom report.');
        this.isExporting = false;
      }
    });
  }

  exportSingleReport(report: any): void {
    this.isExporting = true;
    this.reportingService.getReportData(report.type).subscribe({
      next: (data) => {
        if (!data || data.length === 0) {
          alert('No data available for this report.');
          this.isExporting = false;
          return;
        }

        const safeTitle = report.title ? report.title.replace(/\s+/g, '_') : 'Export';
        switch(this.selectedFormat) {
          case 'CSV':
            this.downloadCSV(data, false, safeTitle);
            break;
          case 'Excel':
            this.downloadExcel(data, false, safeTitle);
            break;
          case 'PDF':
            this.downloadPDF(data, false, report.title);
            break;
        }
        this.isExporting = false;
      },
      error: () => {
        alert('Failed to fetch report data.');
        this.isExporting = false;
      }
    });
  }

  private getHeadersAndRows(items: any[], isReportList: boolean): { headers: string[], rows: any[][] } {
    if (items.length === 0) return { headers: [], rows: [] };
    
    if (isReportList) {
      return {
        headers: ['Report ID', 'Title', 'Owner', 'Type', 'Period', 'Generated', 'Status', 'Size'],
        rows: items.map(i => [i.id, i.title, i.owner, i.type, i.period, i.generated, i.status, i.size])
      };
    } else {
      const headers = Object.keys(items[0]);
      const rows = items.map(item => headers.map(h => item[h]));
      return { headers, rows };
    }
  }

  private downloadCSV(items: any[], isReportList: boolean, filename: string): void {
    const { headers, rows } = this.getHeadersAndRows(items, isReportList);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(field => {
        const val = field !== null && field !== undefined ? String(field) : '';
        return `"${val.replace(/"/g, '""')}"`;
      }).join(',') + '\n';
    });

    this.triggerDownload(csvContent, `${filename}.csv`, 'text/csv');
  }

  private downloadExcel(items: any[], isReportList: boolean, filename: string): void {
    const { headers, rows } = this.getHeadersAndRows(items, isReportList);

    let table = '<table>';
    table += '<thead><tr>' + headers.map(h => `<th style="background:#0b6c78;color:white;padding:8px;font-weight:bold;">${h}</th>`).join('') + '</tr></thead>';
    table += '<tbody>';
    rows.forEach(row => {
      table += '<tr>';
      row.forEach(field => {
        table += `<td style="padding:6px;border:1px solid #ddd;">${field !== null && field !== undefined ? field : ''}</td>`;
      });
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

    this.triggerDownload(excelContent, `${filename}.xls`, 'application/vnd.ms-excel');
  }

  private downloadPDF(items: any[], isReportList: boolean, title: string): void {
    const { headers, rows } = this.getHeadersAndRows(items, isReportList);
    const now = new Date().toLocaleDateString();

    let tableRows = '';
    rows.forEach(row => {
      tableRows += '<tr>';
      row.forEach(field => {
        tableRows += `<td>${field !== null && field !== undefined ? field : ''}</td>`;
      });
      tableRows += '</tr>';
    });

    const html = `
    <html><head><title>${title}</title>
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
      <h1>${title}</h1>
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

  openScheduleModal(): void {
    this.showScheduleModal = true;
  }
  
  closeScheduleModal(): void {
    this.showScheduleModal = false;
  }

  scheduleFrequency = 'Daily';

  scheduleReport(): void {
    const payload = {
      title: 'Scheduled Report',
      type: 'Audit',
      isScheduled: true,
      scheduleFrequency: this.scheduleFrequency
    };

    this.reportingService.createReport(payload).subscribe({
      next: () => {
        alert('Report scheduled successfully!');
        this.closeScheduleModal();
        this.loadReports();
      },
      error: () => {
        alert('Failed to schedule report');
      }
    });
  }

  openNewReportModal(): void {
    this.showNewReportModal = true;
  }

  closeNewReportModal(): void {
    this.showNewReportModal = false;
    this.newReportTitle = '';
  }
  
  createNewReport(): void {
    if (this.newReportTitle.trim()) {
      const payload = {
        title: this.newReportTitle,
        type: this.newReportType,
        isScheduled: false
      };

      this.reportingService.createReport(payload).subscribe({
        next: () => {
          this.closeNewReportModal();
          this.loadReports();
        },
        error: () => {
          alert('Failed to create report');
        }
      });
    }
  }

  private loadReports(): void {
    this.reportingService.getReports().subscribe(data => {
      this.summaries.set(data.summaries);
      this.reportItems.set(data.reportItems);
      this.insights.set(data.insights);
    });
  }
}
