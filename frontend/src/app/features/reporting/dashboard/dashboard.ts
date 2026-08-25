import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ReportingService } from '../services/reporting.service';
import { ToastService } from '../../../shared/services/toast.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-reporting-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class ReportingDashboardComponent implements OnInit {
  private reportingService = inject(ReportingService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);

  readonly metrics = signal<any[]>([]);
  readonly categoryLegend = signal<any[]>([]);
  readonly statusBars = signal<any[]>([]);
  readonly divisionBars = signal<any[]>([]);
  readonly valueBars = signal<any[]>([]);

  greeting = 'Welcome';
  firstName = this.authService.getFirstName() ?? 'Reporter';
  currentDate = new Date();

  readonly donutGradient = computed(() => {
    const legend = this.categoryLegend();
    if (!legend || legend.length === 0) return 'conic-gradient(#94a3b8 0 100%)';
    
    const totalCount = legend.reduce((sum, item) => sum + (item.count || 0), 0);
    let gradientParts = [];
    let currentPercentage = 0;
    
    for (const item of legend) {
      const pct = item.percentage !== undefined && item.percentage !== null
        ? item.percentage 
        : (totalCount > 0 ? (item.count / totalCount) * 100 : (100 / legend.length));
      const nextPercentage = Math.min(100, currentPercentage + pct);
      gradientParts.push(`${item.color} ${currentPercentage}% ${nextPercentage}%`);
      currentPercentage = nextPercentage;
    }
    
    return `conic-gradient(${gradientParts.join(', ')})`;
  });

  ngOnInit(): void {
    const hour = new Date().getHours();
    this.greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    this.reportingService.getDashboard().subscribe({
      next: data => {
        this.metrics.set(data.metrics);
        this.categoryLegend.set(data.categoryLegend);
        this.statusBars.set(data.statusBars);
        this.divisionBars.set(data.divisionBars);
        this.valueBars.set(data.valueBars);
      },
      error: err => {
        console.error('Failed to load reporting dashboard:', err);
        this.toastService.error('Failed to load dashboard data. Please try again.');
      }
    });
  }
}

