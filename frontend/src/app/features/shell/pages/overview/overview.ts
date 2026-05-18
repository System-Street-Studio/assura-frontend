import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge';
import { DataTableComponent, ColumnDef } from '../../../../shared/components/data-table/data-table';
import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar';
import { ActionButtonComponent } from '../../../../shared/components/action-button/action-button';
import { FilterDropdownComponent, FilterGroup, } from '../../../../shared/components/filter-dropdown/filter-dropdown';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

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
    <div class="page">
      <h1 class="page-title">All Assets</h1>

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

  ngOnInit(): void {
    const dashboardUrl = this.authService.getDashboardUrl();
    if (dashboardUrl !== '/overview') {
      this.router.navigate([dashboardUrl]);
    }
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
    { id: '123A', name: 'Dell XPS15', category: 'Computer', status: 'In Use' },
    { id: '234A', name: 'Cisco Switch', category: 'Networking', status: 'Repairing' },
    { id: '994D', name: 'Wooden Table', category: 'Furniture', status: 'Discarded' },
    { id: '034S', name: 'Chair', category: 'Furniture', status: 'In Store' },
  ];

  tableData = [...this.allData];
  searchTerm = '';

  filterGroups: FilterGroup[] = [
    {
      title: 'Assign Divisions',
      required: true,
      options: [
        { label: 'Information Technology', value: 'it', checked: false },
        { label: 'Industrial Services', value: 'industrial', checked: false },
        { label: 'Electronics and Microelectronics', value: 'electronics', checked: false },
        { label: 'Communication Engineering', value: 'communication', checked: false },
        { label: 'Space Applications', value: 'space', checked: false },
        { label: 'Astronomy', value: 'astronomy', checked: false },
        { label: 'Admin', value: 'admin', checked: false },
        { label: 'Finance', value: 'finance', checked: false },
        { label: 'Procurement', value: 'procurement', checked: false },
        { label: 'Stores', value: 'stores', checked: false },
        { label: 'Human Resource', value: 'hr', checked: false },
      ],
    },
    {
      title: 'Category',
      options: [
        { label: 'Computer', value: 'computer', checked: false },
        { label: 'Networking', value: 'networking', checked: false },
        { label: 'Electronics', value: 'electronics', checked: false },
        { label: 'Furniture', value: 'furniture', checked: false },
      ],
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
