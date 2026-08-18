import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-pagination',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    templateUrl: './pagination.html',
    styleUrls: ['./pagination.css'],
})
export class PaginationComponent {
    /** The currently active page (1-indexed). */
    @Input() currentPage = 1;

    /** Total number of pages. */
    @Input() totalPages = 1;

    /** Ordered array of page numbers to render (e.g. [1, 2, 3]). */
    @Input() pageNumbers: number[] = [1];

    /** Emits the requested page number when the user clicks a control. */
    @Output() pageChange = new EventEmitter<number>();

    goTo(page: number): void {
        if (page >= 1 && page <= this.totalPages) {
            this.pageChange.emit(page);
        }
    }
}
