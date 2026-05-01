import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HrAssignmentService } from '../../services/hr-assignment.service';

@Component({
  selector: 'app-hr-pending',
  standalone: true,
  imports: [],
  templateUrl: './pending.html',
  styleUrls: ['./pending.css'],
})
export class HrPendingComponent implements OnInit {
  private router = inject(Router);
  private hrAssignmentService = inject(HrAssignmentService);

  activeUserIdNum = 0;
  readonly pendingUsers = this.hrAssignmentService.pendingUsers;

  ngOnInit(): void {
    this.hrAssignmentService.getPendingUsers().subscribe();
  }

  showDetails(id: number): void {
    this.activeUserIdNum = id;
  }

  hideDetails(): void {
    this.activeUserIdNum = 0;
  }

  openAssignForm(id: number): void {
    this.hrAssignmentService.selectPendingUser(id);
    this.router.navigate(['/hr/form']);
  }
}

