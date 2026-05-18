import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

/* =========================================================
   INTERFACES
   These interfaces define the structure of dashboard data.
========================================================= */

/* Metric card structure */
interface MetricCard {
  label: string;
  value: string;
  trend: string;
  tone: 'blue' | 'red' | 'orange' | 'green' | 'violet' | 'teal';
  icon: string;
  info?: boolean;
}

/* Donut chart legend structure */
interface LegendItem {
  label: string;
  value: string;
  color: string;
}

/* Bar chart structure */
interface BarItem {
  label: string;
  value: number;
  display: string;
  color: string;
}

/* Audit alert structure */
interface AlertItem {
  title: string;
  detail: string;
  level: 'Critical' | 'Warning' | 'High';
  time: string;
  tone: 'red' | 'orange' | 'violet' | 'blue';
  icon: string;
}

/* Risk department structure */
interface RiskDepartment {
  department: string;
  riskLevel: 'High' | 'Medium' | 'Low';
  riskScore: string;
  openIssues: number;
}

/* Audit activity structure */
interface AuditActivity {
  date: string;
  activity: string;
  assetId: string;
  department: string;
  performedBy: string;
  tone: 'blue' | 'green' | 'violet' | 'orange' | 'red';
}

/* Progress bar structure */
interface ProgressItem {
  department: string;
  value: number;
  color: string;
}

/* =========================================================
   COMPONENT
========================================================= */

@Component({
  selector: 'app-reporting-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})

export class ReportingDashboardComponent {

  /* =========================================================
     FILTER VALUES
     These values change dynamically when filters are clicked.
  ========================================================= */

  selectedDateRange = '01/05/2026 - 18/05/2026';
  selectedDepartment = 'All Departments';
  selectedCategory = 'All Categories';
  selectedStatus = 'All Status';
  selectedTrendPeriod = 'This Year';

  /* Footer update time */
  lastUpdated = '18 May 2026, 01:06 PM';

  /* =========================================================
     METRIC CARDS
     Dashboard top statistic cards.
  ========================================================= */

  readonly metrics: MetricCard[] = [
    {
      label: 'Total Assets',
      value: '4,500',
      trend: '+8.5% from last month',
      tone: 'blue',
      icon: 'box',
    },
    {
      label: 'Ghost Assets',
      value: '12',
      trend: '-7.7% from last month',
      tone: 'red',
      icon: 'ghost',
    },
    {
      label: 'Missing Assets',
      value: '8',
      trend: '-11.1% from last month',
      tone: 'orange',
      icon: 'warning',
    },
    {
      label: 'Total Asset Value',
      value: '$5.3M',
      trend: '+12.6% from last month',
      tone: 'green',
      icon: 'money',
      info: true,
    },
    {
      label: 'Under Maintenance',
      value: '63',
      trend: '+3 this week',
      tone: 'orange',
      icon: 'tool',
    },
    {
      label: 'Expired Warranty',
      value: '17',
      trend: '+5 this week',
      tone: 'violet',
      icon: 'shield',
    },
    {
      label: 'Checked-Out Assets',
      value: '142',
      trend: '-6 this week',
      tone: 'blue',
      icon: 'user',
    },
    {
      label: 'Recently Added',
      value: '98',
      trend: '+15 this week',
      tone: 'teal',
      icon: 'search',
    },
  ];

  /* =========================================================
     DONUT CHART LEGEND
  ========================================================= */

  readonly categoryLegend: LegendItem[] = [
    { label: 'Furniture', value: '1,260 (28%)', color: '#054b86' },
    { label: 'Electronics', value: '1,180 (26%)', color: '#ff7900' },
    { label: 'Office Supplies', value: '980 (22%)', color: '#16b447' },
    { label: 'Machinery', value: '620 (14%)', color: '#e02027' },
    { label: 'Vehicles', value: '460 (10%)', color: '#4a5563' },
  ];

  /* =========================================================
     STATUS BAR CHART
  ========================================================= */

  readonly statusBars: BarItem[] = [
    { label: 'In Use', value: 100, display: '2,450', color: '#054b86' },
    { label: 'Available', value: 60, display: '1,480', color: '#0bb336' },
    { label: 'Maintenance', value: 13, display: '320', color: '#ff7900' },
    { label: 'Retired', value: 10, display: '250', color: '#e02027' },
  ];

  /* =========================================================
     DEPARTMENT CHART
  ========================================================= */

  readonly departmentBars: BarItem[] = [
    { label: 'ICT', value: 92, display: '1.5K', color: '#054b86' },
    { label: 'HR', value: 46, display: '720', color: '#ff7900' },
    { label: 'Finance', value: 64, display: '1.0K', color: '#0bb336' },
    { label: 'Stores', value: 84, display: '1.35K', color: '#e02027' },
    { label: 'OPS', value: 96, display: '1.55K', color: '#4a5563' },
  ];

  /* =========================================================
     VALUE CHART
  ========================================================= */

  readonly valueBars: BarItem[] = [
    { label: 'Furniture', value: 88, display: '2.8M', color: '#054b86' },
    { label: 'Electronics', value: 48, display: '1.5M', color: '#ff7900' },
    { label: 'Office Supplies', value: 22, display: '600K', color: '#0bb336' },
    { label: 'Machinery', value: 45, display: '1.4M', color: '#e02027' },
    { label: 'Vehicles', value: 22, display: '600K', color: '#4a5563' },
  ];

  /* =========================================================
     MONTHLY FINDINGS
  ========================================================= */

  readonly monthlyFindings = [
    { month: 'Jan', missing: 50, ghost: 38, maintenance: 18 },
    { month: 'Feb', missing: 64, ghost: 40, maintenance: 15 },
    { month: 'Mar', missing: 48, ghost: 28, maintenance: 18 },
    { month: 'Apr', missing: 64, ghost: 50, maintenance: 22 },
    { month: 'May', missing: 52, ghost: 40, maintenance: 20 },
    { month: 'Jun', missing: 78, ghost: 58, maintenance: 22 },
  ];

  /* =========================================================
     PROGRESS ITEMS
  ========================================================= */

  readonly progressItems: ProgressItem[] = [
    { department: 'ICT', value: 95, color: '#13b65a' },
    { department: 'HR', value: 92, color: '#13b65a' },
    { department: 'Finance', value: 88, color: '#13b65a' },
    { department: 'Operations', value: 95, color: '#22b7b6' },
    { department: 'Stores', value: 76, color: '#2875e8' },
  ];

  /* =========================================================
     ALERTS
  ========================================================= */

  readonly alerts: AlertItem[] = [
    {
      title: 'Ghost asset detected',
      detail: 'Asset ID: AST-000987',
      level: 'Critical',
      time: '10 min ago',
      tone: 'red',
      icon: '!',
    },
    {
      title: 'Maintenance overdue',
      detail: '3 assets require attention',
      level: 'Warning',
      time: '45 min ago',
      tone: 'orange',
      icon: 'w',
    },
  ];

  /* =========================================================
     RISK DEPARTMENTS
  ========================================================= */

  readonly riskDepartments: RiskDepartment[] = [
    { department: 'Stores', riskLevel: 'High', riskScore: '85/100', openIssues: 12 },
    { department: 'IT', riskLevel: 'Medium', riskScore: '62/100', openIssues: 7 },
    { department: 'Finance', riskLevel: 'Low', riskScore: '32/100', openIssues: 2 },
  ];

  /* =========================================================
     AUDIT ACTIVITIES
  ========================================================= */

  readonly auditActivities: AuditActivity[] = [
    {
      date: '18 May 2026 10:35 AM',
      activity: 'Asset Checked Out',
      assetId: 'AST-001245',
      department: 'ICT',
      performedBy: 'Kavitha HR',
      tone: 'blue',
    },
    {
      date: '17 May 2026 04:22 PM',
      activity: 'Asset Transfer Approved',
      assetId: 'AST-001234',
      department: 'Stores',
      performedBy: 'John Auditor',
      tone: 'violet',
    },
  ];

  /* =========================================================
     CHART POINT POSITIONING
     Used to place chart dots dynamically.
  ========================================================= */

  getPointStyle(index: number, value: number): Record<string, string> {
    return {
      left: `${(index / (this.monthlyFindings.length - 1)) * 100}%`,
      bottom: `${value}%`,
    };
  }

  /* =========================================================
     BUTTON FUNCTIONS
     All dashboard buttons and interactions.
  ========================================================= */

  openDateFilter(): void {
    alert('Open date range filter');
  }

  openDepartmentFilter(): void {
    alert('Open department filter');
  }

  openCategoryFilter(): void {
    alert('Open category filter');
  }

  openStatusFilter(): void {
    alert('Open status filter');
  }

  refreshDashboard(): void {
    this.lastUpdated = new Date().toLocaleString();
    alert('Dashboard refreshed successfully');
  }

  changeTrendPeriod(): void {
    this.selectedTrendPeriod = 'Last 6 Months';
  }

  viewMetricDetails(metric: MetricCard): void {
    alert(`Viewing details for ${metric.label}`);
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
  }

  filterByStatus(status: string): void {
    this.selectedStatus = status;
  }

  filterByDepartment(department: string): void {
    this.selectedDepartment = department;
  }

  viewValueCategory(category: string): void {
    alert(`Viewing value details for ${category}`);
  }

  viewMonthlyFinding(month: string, type: string): void {
    alert(`${type} report for ${month}`);
  }

  viewDepartmentProgress(department: string): void {
    alert(`Viewing ${department} verification progress`);
  }

  viewActivityDetails(activity: AuditActivity): void {
    alert(`Viewing activity: ${activity.activity}`);
  }

  viewAllActivities(event?: Event): void {
    event?.preventDefault();
    alert('Viewing all activities');
  }

  viewAllAlerts(event?: Event): void {
    event?.preventDefault();
    alert('Viewing all alerts');
  }

  viewAlertDetails(alert: AlertItem): void {
    alert(`Viewing alert: ${alert.title}`);
  }

  viewComplianceReport(): void {
    alert('Opening compliance report');
  }

  viewVerifiedAssets(): void {
    alert('Viewing verified assets');
  }

  viewUnverifiedAssets(): void {
    alert('Viewing unverified assets');
  }

  viewRiskAssets(): void {
    alert('Viewing risk assets');
  }

  viewAllRiskDepartments(event?: Event): void {
    event?.preventDefault();
    alert('Viewing all risk departments');
  }

  viewRiskDepartment(risk: RiskDepartment): void {
    alert(`Viewing ${risk.department} department risks`);
  }

  openHelp(): void {
    alert('Opening help center');
  }
}