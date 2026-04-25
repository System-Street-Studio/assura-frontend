import { Component } from '@angular/core';

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
export class HrOverviewComponent {
  readonly stats: OverviewStat[] = [
    {
      label: 'Pending to Assign Roles',
      value: 7,
    },
    {
      label: 'Assigned Roles',
      value: 4,
    },
  ];

  readonly usersByDivision: DivisionUserCount[] = [
    { division: 'Information Technology', users: 212 },
    { division: 'Industrial Services', users: 23 },
    { division: 'Electronics and Microelectronics', users: 56 },
    { division: 'Communication Engineering', users: 178 },
    { division: 'Space Applications', users: 5 },
    { division: 'Astronomy', users: 564 },
    { division: 'Admin', users: 66 },
    { division: 'Finance', users: 89 },
    { division: 'Procurement', users: 233 },
    { division: 'Stores', users: 89 },
    { division: 'Human Resource', users: 77 },
  ];
}
