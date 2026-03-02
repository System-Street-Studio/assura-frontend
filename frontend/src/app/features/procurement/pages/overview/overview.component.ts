import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
    selector: 'app-procurement-overview',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './overview.component.html',
    styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit {
    greeting = '';
    firstName = '';
    currentDate = new Date();

    // Hardcoded values for now as per design
    stats = {
        totalSuppliers: 12,
        posNotCompleted: 3,
        posCompleted: 4,
        repairsNotCompleted: 0,
        repairsCompleted: 2
    };

    constructor(private authService: AuthService) { }

    ngOnInit(): void {
        this.firstName = this.authService.getFirstName() ?? 'User';
        this.greeting = this.getGreeting();
    }

    private getGreeting(): string {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    }
}
