import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
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

  readonly donutGradient = computed(() => {
    const legend = this.categoryLegend();
    if (!legend || legend.length === 0) return 'conic-gradient(#94a3b8 0 100%)';
    
    let gradientParts = [];
    let currentPercentage = 0;
    
    for (const item of legend) {
      const nextPercentage = currentPercentage + (item.percentage || (100 / legend.length));
      gradientParts.push(`${item.color} ${currentPercentage}% ${nextPercentage}%`);
      currentPercentage = nextPercentage;
    }
    
    return `conic-gradient(${gradientParts.join(', ')})`;
  });

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

