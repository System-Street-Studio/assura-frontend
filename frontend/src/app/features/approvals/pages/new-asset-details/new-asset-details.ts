import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute,Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { RequestService } from '../../services/requests.service';

@Component({
  selector: 'app-new-asset-details',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './new-asset-details.html',
  styleUrls: ['./new-asset-details.css']
})
export class NewAssetDetailsComponent implements OnInit {
  private router = inject(Router);
  private requestService = inject(RequestService);
  private route = inject(ActivatedRoute);

  request = signal<any> ({});

  ngOnInit() {
    //  Service handling
    if (this.requestService.selectedRequest) {
      console.log("received data from Service ");
      this.request.set(this.requestService.selectedRequest);
    } else {
      // Refresh 
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        console.log("get request by ID:", id);
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


  /*rejectRequest() {
     
    const reason = prompt("Please provide a reason for rejecting this request:");
    
    if (reason === null || reason.trim() === "") {
    alert("Rejection reason is required to proceed.");
    return;
  }
    const id = this.request().id;
    this.requestService.rejectRequest(id, reason).subscribe({
      next: () => {
        this.popupMessage.set('Request Rejected Successfully!');
        this.popupType.set('reject');
        this.showPopup.set(true);
      },
      error: (err) => console.error("Reject error:", err)
    });
  }*/

  close() {
    this.router.navigate(['approvals/requests']); // navigate to the requests page
  }

  closePopup() {
    this.showPopup.set(false);
    this.router.navigate(['approvals/requests']);
  }
}