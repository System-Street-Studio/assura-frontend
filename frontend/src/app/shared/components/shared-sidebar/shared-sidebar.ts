import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface SidebarLink {
  label: string;
  icon: string;
  link: string;
}

@Component({
  selector: 'app-shared-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './shared-sidebar.html',
  styleUrls: ['./shared-sidebar.css'],
})
export class SharedSidebarComponent {
  readonly links: SidebarLink[] = [
    { label: 'Overview', icon: 'home', link: '/hr-overview' },
    { label: 'My Assets', icon: 'assets', link: '/hr-my-assets' },
    { label: 'Pending', icon: 'pending', link: '/hr-pending' },
    { label: 'Assign Role', icon: 'assign', link: '/hr-assign-role' },
    { label: 'Assigned', icon: 'assigned', link: '/hr-assigned' },
  ];
}
