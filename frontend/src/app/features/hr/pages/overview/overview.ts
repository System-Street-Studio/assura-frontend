import { Component, inject, OnInit, computed } from '@angular/core';
import { HrAssignmentService } from '../../services/hr-assignment.service';

export interface OverviewStat {
  label: string;
  value: number;
}

export interface DivisionUserCount {
  division: string;
  users: number;
}

@Component({
  selector: 'app-hr-overview',
  standalone: true,
  imports: [],
  templateUrl: './overview.html',
  styleUrls: ['./overview.css'],
})
export class HrOverviewComponent implements OnInit {
  private hrAssignmentService = inject(HrAssignmentService);

  readonly overview = this.hrAssignmentService.overview;
  readonly assignedUsers = this.hrAssignmentService.assignedUsers;

  readonly stats = computed<OverviewStat[]>(() => {
    const data = this.overview();
    if (!data || !data.stats) return [];
    
    // Map backend stats array directly to component's expected format
    return data.stats.map(s => ({
      label: s.label,
      value: s.value
    }));
  });

  readonly usersByDivision = computed<DivisionUserCount[]>(() => {
    const users = this.assignedUsers();
    const divisionMap = new Map<string, number>();

    users.forEach(u => {
      const count = divisionMap.get(u.division) || 0;
      divisionMap.set(u.division, count + 1);
    });

    return Array.from(divisionMap.entries()).map(([division, users]) => ({
      division,
      users
    }));
  });

  ngOnInit(): void {
    this.hrAssignmentService.getOverview().subscribe();
    this.hrAssignmentService.getAssignedUsers().subscribe();
  }
}

