import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
    summaryStats = [
        { label: 'Total Assets', value: 1200, highlighted: true },
        { label: 'Total Users', value: 100, highlighted: false }
    ];

    assetsByStatus = [
        { label: 'In Use', value: 3200 },
        { label: 'In Store', value: 700 },
        { label: 'Under Maintenance', value: 300 },
        { label: 'Discarded', value: 5210 }
    ];

    assetsByCategory = [
        { label: 'Computers', value: 1200 },
        { label: 'Furniture', value: 2000 },
        { label: 'Networking', value: 300 },
        { label: 'Electronics', value: 1000 }
    ];

    assetsByDivision = [
        { label: 'Information Technology', value: 212 },
        { label: 'Industrial Services', value: 23 },
        { label: 'Electronics and Microelectronics', value: 56 },
        { label: 'Communication Engineering', value: 178 },
        { label: 'Space Applications', value: 5 },
        { label: 'Astronomy', value: 564 },
        { label: 'Admin', value: 66 },
        { label: 'Finance', value: 89 },
        { label: 'Stores', value: 89 },
        { label: 'Human Resource', value: 77 }
    ];
}
