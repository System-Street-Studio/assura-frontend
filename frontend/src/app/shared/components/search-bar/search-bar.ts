import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './search-bar.html',
  styleUrls: ['./search-bar.css'],
})
export class SearchBarComponent implements OnDestroy {
  @Input() placeholder = 'Search...';
  @Output() search = new EventEmitter<string>();

  searchTerm = '';
  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((term) => {
      this.search.emit(term);
    });
  }

  onInput(): void {
    this.searchSubject.next(this.searchTerm);
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }
}
