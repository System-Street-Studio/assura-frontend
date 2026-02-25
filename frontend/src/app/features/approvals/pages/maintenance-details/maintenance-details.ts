import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-maintenance-details',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './maintenance-details.html',
  styleUrls: ['./maintenance-details.css']
})
export class MaintenanceDetailsComponent {
  private router = inject(Router);

  request = signal<any>(history.state.data || {
    asset: 'Table',
    category: 'Furniture',
    issueType: 'Damaged',
    name: 'Jenny Athapaththu (ID:EST001)',
    submittedDate: '15-08-2025',
    description: 'due to loose joints and surface damage',
    status: 'pending',
    attachment: 'No Attachments',
    needTemporary: 'Yes'
  });

  approveRequest() { console.log('Approved'); }
  rejectRequest() { console.log('Rejected'); }
  
  close() {
    this.router.navigate(['/approvals/requests']);
  }
}