import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-procurement-overview',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './overview.component.html',
    styleUrls: ['./overview.component.css']
})
export class OverviewComponent {
    // Hardcoded values for now as per design
    stats = {
        totalSuppliers: 12,
        posNotCompleted: 3,
        posCompleted: 4,
        repairsNotCompleted: 0,
        repairsCompleted: 2
    };
}
