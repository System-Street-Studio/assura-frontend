import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-acc-navbar',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './acc-navbar.html',
    styleUrls: ['./acc-navbar.css']
})
export class AccNavbarComponent {
    constructor(private router: Router) { }

    goToRoleSelect() {
        this.router.navigate(['/']);
    }
}
