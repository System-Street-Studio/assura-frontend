import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReportingService } from '../services/reporting.service';

@Component({
  selector: 'app-reporting-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report.html',
  styleUrls: ['./report.css'],
})
export class ReportingReportComponent implements OnInit {
  private reportingService = inject(ReportingService);

  readonly summaries = signal<any[]>([]);
  readonly reportItems = signal<any[]>([]);
  readonly insights = signal<any[]>([]);

  ngOnInit(): void {
    this.reportingService.getReports().subscribe(data => {
      this.summaries.set(data.summaries);
      this.reportItems.set(data.reportItems);
      this.insights.set(data.insights);
    });
  }
}

