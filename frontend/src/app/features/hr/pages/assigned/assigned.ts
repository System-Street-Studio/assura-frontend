import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HrAssignmentService } from '../../services/hr-assignment.service';

@Component({
  selector: 'app-hr-assigned',
  standalone: true,
  imports: [],
  templateUrl: './assigned.html',
  styleUrls: ['./assigned.css'],
})
export class HrAssignedComponent implements OnInit {
  private hrAssignmentService = inject(HrAssignmentService);
  private router = inject(Router);

  readonly assignedUsers = this.hrAssignmentService.assignedUsers;

  ngOnInit(): void {
    this.hrAssignmentService.getAssignedUsers().subscribe();
  }

  openEditForm(id: number): void {
    this.hrAssignmentService.selectUserForAssignment(id);
    this.router.navigate(['/hr/assign-role']);
  }
}

