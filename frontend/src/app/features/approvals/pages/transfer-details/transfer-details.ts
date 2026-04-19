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
  request = signal<any>(history.state.data || {/*
    asset: 'Table',
    category: 'Furniture',
    quantity: 1,
    name: 'Jenny Athapaththu (ID:EST001)',
    submittedDate: '15-08-2025',
    timelineFrom: '15-08-2025',
    timelineTo: '15-09-2025',
    specs: 'Height: 28-30 inches \n Width: 40-72 inches \n Depth: 24-32 inches',
    reason: 'my table is discarded and need another for temporary use until new table received.'*/
  });

  ngOnInit() {
    // 1. Service එකේ ඇති දත්ත පරීක්ෂා කිරීම
    if (this.requestService.selectedRequest) {
      this.request.set(this.requestService.selectedRequest);
    } else {
      // 2. Refresh වුවහොත් URL එකෙන් ID එක ගෙන API call එකක් යැවීම
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        // ඔබේ Service එකේ getRequestById(id) එකක් තිබේ නම් එය මෙහි භාවිතා කරන්න
       /* this.requestService.getRequestById(+id).subscribe((data) => {
          this.request.set(data);
        });*/
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

  viewInPool() { console.log('Viewing in Pool'); }

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

