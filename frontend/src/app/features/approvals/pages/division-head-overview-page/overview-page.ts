import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

interface Activity {
  description: string;
  timestamp: string;
  status: 'Approved' | 'Pending' | 'Transferred';
}

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './overview-page.html',
  styleUrls: ['./overview-page.css']
})
export class DivisionHeadOverviewComponent {
  recentActivities = signal<Activity[]>([
    { description: 'Transfer request from Harry Ekanayake approved.', timestamp: '5 minutes ago', status: 'Approved' },
    { description: 'New asset request received from Sarah.', timestamp: '30 minutes ago', status: 'Pending' },
    { description: 'Asset "Monitor UltraWide" Transfer to employee :EST001 IT division', timestamp: '1 hour ago', status: 'Transferred' },
    { description: 'Maintenance request received from Harry', timestamp: '2 hours ago', status: 'Approved' }
  ]);
}