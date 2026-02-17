import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FilterOption {
  label: string;
  value: string;
  checked: boolean;
}

export interface FilterGroup {
  title: string;
  required?: boolean;
  options: FilterOption[];
}

@Component({
  selector: 'app-filter-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-dropdown.html',
  styleUrls: ['./filter-dropdown.css'],
})
export class FilterDropdownComponent {
  @Input() groups: FilterGroup[] = [];
  @Output() closed = new EventEmitter<FilterGroup[]>();

  onClose(): void {
    this.closed.emit(this.groups);
  }
}
