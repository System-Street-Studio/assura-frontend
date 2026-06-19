import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReportingService } from '../services/reporting.service';

@Component({
  selector: 'app-reporting-auditlog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auditlog.html',
  styleUrls: ['./auditlog.css'],
})
export class ReportingAuditlogComponent implements OnInit {
  private reportingService = inject(ReportingService);

  readonly stats = signal<any[]>([]);
  readonly logs = signal<any[]>([]);

  ngOnInit(): void {
    this.reportingService.getAuditLogs().subscribe(data => {
      this.stats.set(data.stats);
      this.logs.set(data.logs);
    });
  }
}

