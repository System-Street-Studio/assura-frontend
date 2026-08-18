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
  @Input() data: Record<string, any>[] = [];
  @Output() rowClick = new EventEmitter<any>();

  onRowClick(row: any): void {
    this.rowClick.emit(row);
  }
}
