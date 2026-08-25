import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReportingService } from '../services/reporting.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-reporting-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report.html',
  styleUrls: ['./report.css'],
})
export class ReportingReportComponent implements OnInit {
  private reportingService = inject(ReportingService);
  private toastService = inject(ToastService);

  readonly summaries = signal<any[]>([]);
  readonly reportItems = signal<any[]>([]);

  readonly searchTerm = signal('');

  readonly selectedType = signal('All');
  readonly selectedStatus = signal('All');
  readonly showTypeDropdown = signal(false);
  readonly showStatusDropdown = signal(false);

  readonly availableTypes = computed(() => {
    const defaults = ['Audit', 'Exception', 'Lifecycle', 'Finance'];
    const fromReports = this.reportItems().map(r => r.type).filter(Boolean);
    return ['All', ...Array.from(new Set([...defaults, ...fromReports]))];
  });

  readonly availableStatuses = computed(() => {
    const defaults = ['Completed', 'Pending', 'Ready'];
    const fromReports = this.reportItems().map(r => r.status).filter(Boolean);
    return ['All', ...Array.from(new Set([...defaults, ...fromReports]))];
  });

  readonly filteredReports = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const type = this.selectedType();
    const status = this.selectedStatus();

    return this.reportItems().filter(r => {
      const matchesTerm = !term ||
        r.id?.toLowerCase().includes(term) ||
        r.title?.toLowerCase().includes(term) ||
        r.owner?.toLowerCase().includes(term) ||
        r.type?.toLowerCase().includes(term);

      const matchesType = type === 'All' || r.type?.toLowerCase() === type.toLowerCase();
      
      const rStatus = (r.status || '').toLowerCase();
      const targetStatus = status.toLowerCase();
      const matchesStatus = status === 'All' || 
        rStatus === targetStatus ||
        (targetStatus === 'completed' && rStatus === 'ready') ||
        (targetStatus === 'ready' && rStatus === 'completed');

      return matchesTerm && matchesType && matchesStatus;
    });
  });

  selectedFormat = 'CSV';
  selectedDateRange = 'this-month';
  selectedExportType = 'Audit';
  isExporting = false;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container')) {
      this.showTypeDropdown.set(false);
      this.showStatusDropdown.set(false);
    }
  }

  ngOnInit(): void {
    this.loadReports();
  }

  toggleTypeDropdown(event?: Event): void {
    if (event) event.stopPropagation();
    this.showTypeDropdown.set(!this.showTypeDropdown());
    this.showStatusDropdown.set(false);
  }

  toggleStatusDropdown(event?: Event): void {
    if (event) event.stopPropagation();
    this.showStatusDropdown.set(!this.showStatusDropdown());
    this.showTypeDropdown.set(false);
  }

  selectType(type: string): void {
    this.selectedType.set(type);
    this.showTypeDropdown.set(false);
  }

  selectStatus(status: string): void {
    this.selectedStatus.set(status);
    this.showStatusDropdown.set(false);
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

  readonly showScheduleModal = signal(false);
  readonly showNewReportModal = signal(false);
  readonly scheduleTitle = signal('');
  readonly scheduleType = signal('Audit');
  readonly scheduleFrequency = signal('Daily');
  readonly newReportTitle = signal('');
  readonly newReportType = signal('Audit');

  openScheduleModal(): void {
    this.showScheduleModal.set(true);
  }

  closeScheduleModal(): void {
    this.showScheduleModal.set(false);
    this.scheduleTitle.set('');
    this.scheduleType.set('Audit');
    this.scheduleFrequency.set('Daily');
  }

  scheduleReport(): void {
    const title = this.scheduleTitle().trim();
    if (!title) return;

    const payload = {
      title,
      type: this.scheduleType(),
      isScheduled: true,
      scheduleFrequency: this.scheduleFrequency()
    };

    this.reportingService.createReport(payload).subscribe({
      next: () => {
        this.toastService.success('Report scheduled successfully!');
        this.closeScheduleModal();
        this.loadReports();
      },
      error: () => {
        this.toastService.error('Failed to schedule report');
      }
    });
  }

  openNewReportModal(): void {
    this.showNewReportModal.set(true);
  }

  closeNewReportModal(): void {
    this.showNewReportModal.set(false);
    this.newReportTitle.set('');
    this.newReportType.set('Audit');
  }
  
  createNewReport(): void {
    const title = this.newReportTitle().trim();
    if (title) {
      const payload = {
        title,
        type: this.newReportType(),
        isScheduled: false
      };

      this.reportingService.createReport(payload).subscribe({
        next: () => {
          this.toastService.success('Report created successfully!');
          this.closeNewReportModal();
          this.loadReports();
        },
        error: () => {
          this.toastService.error('Failed to create report');
        }
      });
    }
  }

  markCompleted(report: any): void {
    this.reportingService.markReportCompleted(report.id).subscribe({
      next: () => {
        this.toastService.success('Report marked as completed.');
        this.loadReports();
      },
      error: err => {
        console.error('Failed to mark report completed:', err);
        this.toastService.error('Failed to mark report as completed.');
      }
    });
  }

  private loadReports(): void {
    this.reportingService.getReports().subscribe({
      next: data => {
        this.summaries.set(data.summaries);
        this.reportItems.set(data.reportItems);
      },
      error: err => {
        console.error('Failed to load reports:', err);
        this.toastService.error('Failed to load reports. Please try again.');
      }
    });
  }
}
