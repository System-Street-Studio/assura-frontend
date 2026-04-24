import { Component, inject, signal,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule,ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
//import { Location } from '@angular/common';
import { RequestService } from '../../services/requests.service';
//import { TransferService } from '../../../approvals/services/transfer.service';

@Component({
  selector: 'app-transfer-asset-details',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './transfer-details.html',
  styleUrls: ['./transfer-details.css']
})
export class TransferDetailsComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute); // මේ line එක අනිවාර්යයෙන් එක් කරන්න
  //private location = inject(Location);
  private requestService = inject(RequestService);
  //private transferService = inject(TransferService);

  // Navigation state එකෙන් එන දත්ත ලබා ගැනීම
  request = signal<any>({});
  isLoading = signal<boolean>(true);
  error = signal<string>('');
  isReadOnly = signal<boolean>(false);

  ngOnInit() {
    // Check for readOnly query parameter
    const readOnly = this.route.snapshot.queryParamMap.get('readOnly');
    this.isReadOnly.set(readOnly === 'true');
    console.log('Is read-only mode:', this.isReadOnly());

    //  Service handling
    if (this.requestService.selectedRequest) {
      console.log("received data from Service ");
      this.request.set(this.requestService.selectedRequest);
      this.isLoading.set(false);
    } else {
      // Refresh 
      const id = this.route.snapshot.paramMap.get('id');
      console.log("Route ID parameter:", id);
      if (id) {
        console.log("get request by ID:", id);
        this.requestService.getRequestById(+id).subscribe({
          next: (data) => {
            console.log("Data fetched:", data);
            this.request.set(data);
            this.isLoading.set(false);
          },
          error: (err) => {
            console.error("API error:", err);
            this.error.set('Failed to load request details');
            this.isLoading.set(false);
          }
        });
      } else {
        console.warn("No ID found in route");
        this.error.set('No request ID provided');
        this.isLoading.set(false);
      }
    }
  }

  showPopup = signal(false);
  popupMessage = signal('');
  popupType = signal<'success' | 'reject'>('success');

  
  approveRequest() {
    const id = this.request().id;
    console.log("Approving Request ID:", id);

    if (!id) {
      console.error("Error: Request ID is missing!");
      return;
    }

    // Update request status to approved using RequestService
    this.requestService.approveRequest(id).subscribe({
      next: () => {
        console.log("Transfer request approved successfully");
        
        // Update local request object to show approved status
        const updatedRequest = { ...this.request(), status: 'approved' };
        this.request.set(updatedRequest);
        
        // Show success popup immediately
        this.popupMessage.set('Transfer Request Approved Successfully');
        this.popupType.set('success');
        this.showPopup.set(true);
        
        console.log('Request status updated to approved');
        console.log('Popup should be visible now');
      },
      error: (err) => {
        console.error("Approve error details:", err);
        this.popupMessage.set('Failed to approve request. Please try again.');
        this.popupType.set('reject');
        this.showPopup.set(true);
      }
    });
  }

  rejectRequest() {
    const id = this.request().id;
    this.requestService.rejectRequest(id).subscribe({
      next: () => {
        this.popupMessage.set('Request Rejected Successfully!');
        this.popupType.set('reject');
        this.showPopup.set(true);
        this.router.navigate(['/approvals/requests']);
      },
      error: (err) => console.error("Reject error:", err)
    });
  }

  

  getTransferDates() {
    const reason = this.request().justification || this.request().reason || '';
    const match = reason.match(/\(Transfer periods:([^)]*)\)/);
    if (match) {
      const period = match[1].trim();
      const dateParts = period.split('to').map((d: string) => d.trim());
      return { from: dateParts[0] || '', to: dateParts[1] || '' };
    }
    return { from: '', to: '' };
  }

  getCleanReason() {
    const reason = this.request().justification || this.request().reason || '';
    
    // Remove transfer period information in all possible formats:
    // (Transfer periods: date to date)
    // [Transfer periods: date to date]
    // Transfer periods: date to date
    // Including multi-line and case-insensitive
    let cleanedReason = reason
      .replace(/\s*[\(\[]*Transfer periods?:\s*[^\)]*[\)\]]*\s*/gi, '')
      .replace(/\s*\(Transfer periods?.*?\)\s*/gi, '')
      .replace(/\s*\[Transfer periods?.*?\]\s*/gi, '')
      .trim();
    
    // If nothing was removed, just return original trimmed
    if (cleanedReason === reason.trim()) {
      return reason.trim();
    }
    
    return cleanedReason || reason.trim();
  }

viewInPool() {
  const requestId = this.request().id;
  console.log("received requestID-" + requestId + " to pool-page");
  console.log("Navigating to pool with request ID:", requestId);
  
  this.router.navigate(['/approvals/asset-pool'], {
    state: { 
      transferRequestId: requestId,
      message: 'received requestID-' + requestId + ' to pool-page'
    }
  }).then(nav => {
    console.log('Navigation Status:', nav);
  }, err => {
    console.error('Navigation Error:', err); 
  });
}

  
  close() {
    this.router.navigate(['approvals/requests']); // navigate to the requests page
  }

  closePopup() {
    this.showPopup.set(false);
   
  }
}

