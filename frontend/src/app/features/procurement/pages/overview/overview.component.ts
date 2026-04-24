import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/auth/auth.service';
import { ProcurementService } from '../../services/procurement.service';

@Component({
    selector: 'app-procurement-overview',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './overview.component.html',
    styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit {
    private authService = inject(AuthService);
    private procurementService = inject(ProcurementService);

    greeting = '';
    firstName = '';
    currentDate = new Date();

    stats = {
        totalSuppliers: 0,
        posNotCompleted: 0,
        posCompleted: 0,
        repairsNotCompleted: 0,
        repairsCompleted: 0
    };

    ngOnInit(): void {
        this.firstName = this.authService.getFirstName() ?? 'User';
        this.greeting = this.getGreeting();
        this.loadStats();
    }

    private loadStats(): void {
        this.procurementService.getProcurementStats().subscribe({
            next: (data) => {
                console.log('[DEBUG] OverviewComponent: Received stats data:', data);
                // Using defensive mapping to handle both camelCase and PascalCase
                this.stats = {
                    totalSuppliers: data.totalSuppliers ?? data.TotalSuppliers ?? 0,
                    posNotCompleted: data.posNotCompleted ?? data.PosNotCompleted ?? 0,
                    posCompleted: data.posCompleted ?? data.PosCompleted ?? 0,
                    repairsNotCompleted: data.repairsNotCompleted ?? data.RepairsNotCompleted ?? data.repairsNoCompleted ?? 0,
                    repairsCompleted: data.repairsCompleted ?? data.RepairsCompleted ?? 0
                };
                console.log('[DEBUG] OverviewComponent: Updated stats object:', this.stats);
            },
            error: (err) => {
                console.error('Error loading procurement stats', err);
            }
        });
    }

    private getGreeting(): string {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    }
}
