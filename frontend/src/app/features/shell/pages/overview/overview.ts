import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge';
import { DataTableComponent, ColumnDef } from '../../../../shared/components/data-table/data-table';
import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar';
import { ActionButtonComponent } from '../../../../shared/components/action-button/action-button';
import { FilterDropdownComponent, FilterGroup, } from '../../../../shared/components/filter-dropdown/filter-dropdown';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { CategoryService } from '../../../inventory/services/category.service';
import { DivisionService } from '../../../inventory/services/division.service';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    CommonModule,
    DataTableComponent,
    SearchBarComponent,
    ActionButtonComponent,
    FilterDropdownComponent,
  ],
  template: `
    @if (isPendingUser) {
      <div class="pending-user-view" style="display: flex; align-items: center; justify-content: center; height: calc(100vh - 120px); text-align: center; flex-direction: column;">
        <div class="glass-card" style="padding: 48px; max-width: 500px; display: flex; flex-direction: column; align-items: center; gap: 24px; border: 1px solid rgba(245, 158, 11, 0.3); background: rgba(30, 41, 59, 0.65); border-radius: 16px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h2 style="color: #f8fafc; font-size: 24px; font-weight: 700; margin: 0;">Account Under Review</h2>
          <p style="color: #94a3b8; font-size: 16px; margin: 0; line-height: 1.5;">Your account is under review, wait for HR review.</p>
        </div>
      </div>
    } @else {
    <div style="padding: 32px; max-width: 1200px; margin: 0 auto; height: 100%; overflow-y: auto;">
      <!-- Greeting Banner -->
      <section class="assura-greeting-banner" style="display: flex; justify-content: space-between; align-items: center; position: relative; overflow: hidden; margin-bottom: 24px;">
        <!-- Decorative blurred circles; purely visual, pointer-events: none -->
        <div class="banner-bg-shape"></div>
        <div class="banner-bg-shape secondary"></div>

        <div class="welcome-left">
          <h1 class="assura-greeting-text">{{ greeting }}, {{ firstName }}</h1>
          <p class="assura-greeting-date">Here's your system overview for {{ currentDate | date:'EEEE, MMMM d, yyyy — h:mm a' }}</p>
        </div>
      </section>

      <h1 class="assura-page-title">All Assets</h1>

      <div class="toolbar">
        <div class="toolbar-left">
          <app-search-bar
            placeholder="Search Assets..."
            (queryChange)="onSearch($event)"
          ></app-search-bar>
          <app-action-button label="Check in" icon="check_circle_outline"></app-action-button>
          <app-action-button label="Check out" icon="exit_to_app"></app-action-button>
        </div>
        <div class="toolbar-right">
          <div class="filter-wrapper">
            <app-action-button
              label="Filter"
              icon="filter_alt"
              (clicked)="toggleFilter()"
            ></app-action-button>
            @if (showFilter) {
            <app-filter-dropdown
              [groups]="filterGroups"
              (closed)="onFilterClose($event)"
            >
            </app-filter-dropdown>
            }
          </div>
          <app-action-button label="New" icon="add"></app-action-button>
        </div>
      </div>

      <app-data-table
        [columns]="columns"
        [data]="tableData"
        (rowClick)="onRowClick($event)"
      ></app-data-table>
    </div>
    }
  `,
  styles: [
    `
      .page {
        padding: 28px 32px;
        font-family: 'Jost', sans-serif;
      }
      .page-title {
        font-size: 1.6rem;
        font-weight: 700;
        color: #1a1a1a;
        margin-bottom: 20px;
      }
      .toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
        gap: 12px;
      }
      .toolbar-left,
      .toolbar-right {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .filter-wrapper {
        position: relative;
      }
    `,
  ],
})
export class OverviewComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private categoryService = inject(CategoryService);
  private divisionService = inject(DivisionService);

  greeting = 'Welcome';
  firstName = 'Admin';
  currentDate = new Date();
  isPendingUser = false;

  ngOnInit(): void {
    this.isPendingUser = this.authService.hasRole('Pending');
    if (this.isPendingUser) return;
    
    const hour = new Date().getHours();
    this.greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
    const dashboardUrl = this.authService.getDashboardUrl();
    if (dashboardUrl !== '/overview') {
      this.router.navigate([dashboardUrl]);
    }
    this.loadCategories();
    this.loadDivisions();
  }

  private loadDivisions(): void {
    this.divisionService.getAll().subscribe({
      next: (divisions) => {
        const divisionGroup = this.filterGroups.find(g => g.title === 'Assign Divisions');
        if (divisionGroup) {
          divisionGroup.options = divisions.map(d => ({
            label: d.name,
            value: d.name.toLowerCase().replace(/\s+/g, '_'),
            checked: false,
          }));
        }
      },
    });
  }

  private loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (categories) => {
        const categoryGroup = this.filterGroups.find(g => g.title === 'Category');
        if (categoryGroup) {
          categoryGroup.options = categories.map(c => ({
            label: c.name,
            value: c.name.toLowerCase().replace(/\s+/g, '_'),
            checked: false,
          }));
        }
      },
    });
  }

  showFilter = false;
  // ...

  columns: ColumnDef[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'category', label: 'Category' },
    { key: 'status', label: 'Status', type: 'status' },
  ];

  allData = [
    { id: '123A', name: 'Dell XPS15', category: 'Computer & Peripherals', status: 'In Use' },
    { id: '234A', name: 'Cisco Switch', category: 'Office Equipment', status: 'Repairing' },
    { id: '994D', name: 'Wooden Table', category: 'Furniture & Fittings', status: 'Discarded' },
    { id: '034S', name: 'Chair', category: 'Furniture & Fittings', status: 'In Store' },
  ];

  tableData = [...this.allData];
  searchTerm = '';

  filterGroups: FilterGroup[] = [
    {
      title: 'Assign Divisions',
      required: true,
      options: [], // Populated dynamically from DivisionService
    },
    {
      title: 'Category',
      options: [], // Populated dynamically from CategoryService
    },
    {
      title: 'Status',
      options: [
        { label: 'In Use', value: 'in_use', checked: false },
        { label: 'Repairing', value: 'repairing', checked: false },
        { label: 'Discarded', value: 'discarded', checked: false },
        { label: 'In Store', value: 'in_store', checked: false },
      ],
    },
  ];

  toggleFilter(): void {
    this.showFilter = !this.showFilter;
  }

  onFilterClose(groups: FilterGroup[]): void {
    console.log('Filters closed', groups);
    this.showFilter = false;
    this.applyFilters();
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.allData];

    // Filter by category
    const categoryGroup = this.filterGroups.find((g) => g.title === 'Category');
    const selectedCategories =
      categoryGroup?.options.filter((o) => o.checked).map((o) => o.label) || [];
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((row) => selectedCategories.includes(row.category));
    }

    // Filter by status
    const statusGroup = this.filterGroups.find((g) => g.title === 'Status');
    const selectedStatuses =
      statusGroup?.options.filter((o) => o.checked).map((o) => o.label) || [];
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((row) => selectedStatuses.includes(row.status));
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (row) =>
          row.id.toLowerCase().includes(term) ||
          row.name.toLowerCase().includes(term) ||
          row.category.toLowerCase().includes(term) ||
          row.status.toLowerCase().includes(term),
      );
    }

    this.tableData = filtered;
  }

  onRowClick(row: unknown): void {
    console.log('Row clicked:', row);
  }
}
