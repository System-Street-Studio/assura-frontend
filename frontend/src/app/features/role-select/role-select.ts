import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-role-select',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './role-select.html',
    styleUrls: ['./role-select.css']
})
export class RoleSelectComponent {
    constructor(private router: Router) { }

    selectRole(role: string) {
        if (role === 'superintendent') {
            this.router.navigate(['/superintendent']);
        } else {
            this.router.navigate(['/accountant']);
        }
    }
}
