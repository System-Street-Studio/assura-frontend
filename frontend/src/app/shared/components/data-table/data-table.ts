import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusBadgeComponent } from '../status-badge/status-badge';

export interface ColumnDef {
  key: string;
  label: string;
  type?: 'text' | 'status' | 'link';
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent],
  templateUrl: './data-table.html',
  styleUrls: ['./data-table.css'],
})
export class DataTableComponent {
  @Input() columns: ColumnDef[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() data: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Output() rowClick = new EventEmitter<any>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onRowClick(row: any): void {
    this.rowClick.emit(row);
  }
}
