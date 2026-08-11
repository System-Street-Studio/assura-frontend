import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReportingService } from '../services/reporting.service';

@Component({
  selector: 'app-reporting-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class ReportingDashboardComponent implements OnInit {
  private reportingService = inject(ReportingService);

  readonly metrics = signal<any[]>([]);
  readonly categoryLegend = signal<any[]>([]);
  readonly statusBars = signal<any[]>([]);
  readonly divisionBars = signal<any[]>([]);
  readonly valueBars = signal<any[]>([]);
  readonly anomalies = signal<any>({ ghostAssetsDetected: 0, missingPhysicalVerification: 0 });

  greeting = 'Welcome';
  firstName = 'Reporter';
  currentDate = new Date();

  ngOnInit(): void {
    const hour = new Date().getHours();
    this.greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    this.reportingService.getDashboard().subscribe(data => {
      this.metrics.set(data.metrics);
      this.categoryLegend.set(data.categoryLegend);
      this.statusBars.set(data.statusBars);
      this.divisionBars.set(data.divisionBars);
      this.valueBars.set(data.valueBars);
      this.anomalies.set(data.anomalies);
    });
  }
}

