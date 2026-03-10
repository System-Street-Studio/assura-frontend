import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-requests-main',
  standalone: true,
  imports: [CommonModule,RouterModule,MatIconModule],
  templateUrl: './requests-main.html',
  styleUrl: './requests-main.css',
})
export class RequestsMainComponent /*implements OnInit*/ {
  
  /*recentRequests: any[] = [];

  constructor(private assetService: AssetService,private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory() {
  this.assetService.getRequests().subscribe({
    next: (data: any[]) => {
      // Backend returns submittedDate as string
      this.recentRequests = data;
      console.log('History Loaded:', data);
      this.cdr.detectChanges();
    },
    error: (err: any) => console.error('Load failed', err)
  });*/



  recentRequests: any[] = [
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
 /* onInitiateRequest(type: string) {
    alert(`Initiating a new ${type}...`);
  }*/

}
