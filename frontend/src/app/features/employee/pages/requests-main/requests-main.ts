import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AssetRequest, AssetService } from '../../services/asset-request.service';


@Component({
  selector: 'app-requests-main',
  standalone: true,
  imports: [CommonModule,RouterModule,MatIconModule],
  templateUrl: './requests-main.html',
  styleUrl: './requests-main.css',
})
export class RequestsMainComponent implements OnInit {
  recentRequests: AssetRequest[] = [];
  
  constructor(private assetService: AssetService,private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.assetService.getPendingRequests().subscribe({
      next: (data: AssetRequest[]) => {
        this.recentRequests = data;
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('Error fetching pending requests:', err)
    });
  }



  viewRequestDetails(requestId: number) {
    console.log('Navigating to details for request:', requestId);
    
    // this.router.navigate(['/requests/details', requestId]);
  }
}
  
  


