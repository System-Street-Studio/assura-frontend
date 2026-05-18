import { Component } from '@angular/core';
import { SharedNavbarComponent } from '../../../../shared/components/shared-navbar/shared-navbar';
import { SharedSidebarComponent } from '../../../../shared/components/shared-sidebar/shared-sidebar';

// OverviewStat keeps the statistic cards small and consistent in the template.
export interface OverviewStat {
  label: string;
  value: number;
}

// DivisionUserCount powers the division list without tying the template to a backend shape.
export interface DivisionUserCount {
  division: string;
  users: number;
}

@Component({
  selector: 'app-hr-overview',
  standalone: true,
  imports: [SharedNavbarComponent, SharedSidebarComponent],
  templateUrl: './overview.html',
  styleUrls: ['./overview.css'],
})
export class HrOverviewComponent {
  // Static numbers give HR a dashboard preview until these totals are wired to real services.
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

  // Division rows are kept as data so the template can render the list with one @for block.
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
