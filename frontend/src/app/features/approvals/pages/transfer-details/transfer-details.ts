import { Component, inject, signal,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule,ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Location } from '@angular/common';
import { RequestService } from '../../services/requests.service';


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
  private location = inject(Location);
  private requestService = inject(RequestService);
  
  // Navigation state එකෙන් එන දත්ත ලබා ගැනීම
  request = signal<any>({});
  isLoading = signal<boolean>(true);

  ngOnInit() {
    // 1. Service එකේ ඇති දත්ත පරීක්ෂා කිරීම
    if (this.requestService.selectedRequest) {
      console.log("received data from Service");
      this.request.set(this.requestService.selectedRequest);
      this.isLoading.set(false);
    } else {
      // 2. Refresh වුවහොත් URL එකෙන් ID එක ගෙන API call එකක් යැවීම
      const id = this.route.snapshot.paramMap.get('id');
      console.log("Route ID parameter:", id);
      if (id) {
        this.requestService.getRequestById(+id).subscribe({
          next: (data) => {
            console.log("Data fetched:", data);
            this.request.set(data);
            this.isLoading.set(false);
          },
          error: (err) => {
            console.error("API error:", err);
            this.isLoading.set(false);
          }
        });
      } else {
        console.warn("No ID found in route");
        this.isLoading.set(false);
      }
    }
  }


  showPopup = signal(false);
  popupMessage = signal('');
  popupType = signal<'success' | 'reject'>('success');


   approveRequest() {
      const id = this.request().id;
    this.requestService.approveRequest(id).subscribe({
      next: () => {
        this.popupMessage.set('Request Approved Successfully');
        this.popupType.set('success');
        this.showPopup.set(true);
      },
      error: (err) => console.error("Approve error:", err)
    });
  }

  rejectRequest() {
    const id = this.request().id;
    this.requestService.rejectRequest(id).subscribe({
      next: () => {
        this.popupMessage.set('Request Rejected Successfully!');
        this.popupType.set('reject');
        this.showPopup.set(true);
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
  console.log("Navigating to pool...");
  this.router.navigate(['/approvals/asset-pool']).then(nav => {
    console.log('Navigation Status:', nav);
  }, err => {
    console.error('Navigation Error:', err); 
  });
}

  close() {
    const returnTab = this.route.snapshot.queryParamMap.get('tab') || 'transfer';
    this.router.navigate(['/approvals/requests'], { queryParams: { tab: returnTab } });
  }
  
   closePopup() {
    this.showPopup.set(false);
    const returnTab = this.route.snapshot.queryParamMap.get('tab') || 'transfer';
    this.router.navigate(['approvals/requests'] , { queryParams: { tab: returnTab } });
  }
}

