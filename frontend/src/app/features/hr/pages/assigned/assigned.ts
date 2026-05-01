import { Component, inject, OnInit } from '@angular/core';
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

  readonly assignedUsers = this.hrAssignmentService.assignedUsers;

  ngOnInit(): void {
    this.hrAssignmentService.getAssignedUsers().subscribe();
  }
}

