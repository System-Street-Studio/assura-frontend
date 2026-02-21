import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

interface AssetRequest {
  id: string;
  assetName: string;
  submittedDate: Date;
  status: 'Pending' | 'Approved' | 'Rejected';
  type: string;
}

@Component({
  selector: 'app-requests-main',
  imports: [CommonModule,RouterModule],
  templateUrl: './requests-main.html',
  styleUrl: './requests-main.css',
})
export class RequestsMainComponent {

  recentRequests: AssetRequest[] = [
    {
      id: 'REQ-1001',
      assetName: 'Dell Latitude 5420',
      submittedDate: new Date('2026-02-15'),
      status: 'Pending',
      type: 'New Asset Request'
    },
    {
      id: 'REQ-1002',
      assetName: 'Logitech MX Master 3S',
      submittedDate: new Date('2026-02-18'),
      status: 'Approved',
      type: 'New Asset Request'
    },
    {
      id: 'REQ-1003',
      assetName: 'Office Ergonomic Chair',
      submittedDate: new Date('2026-02-19'),
      status: 'Rejected',
      type: 'New Asset Request'
    }
  ];

  constructor() { }
  viewRequestDetails(requestId: string) {
    console.log('Navigating to details for request:', requestId);
    
    // this.router.navigate(['/requests/details', requestId]);
  }

  
   /* Helper method to handle button clicks for new requests*/
  onInitiateRequest(type: string) {
    alert(`Initiating a new ${type}...`);
  }
}
