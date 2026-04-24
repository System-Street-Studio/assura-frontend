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
    this.requestService.approveRequest(id).subscribe({
      next: () => {
        this.popupMessage.set('Request Approved Successfully');
        this.popupType.set('success');
        this.showPopup.set(true);
        this.router.navigate(['/approvals/requests']);
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
        this.router.navigate(['/approvals/requests']);
      },
      error: (err) => console.error("Reject error:", err)
    });
  }


  close() {
    this.router.navigate(['approvals/requests']); // navigate to the requests page
  }

  closePopup() {
    this.showPopup.set(false);
    this.router.navigate(['approvals/requests']);
  }
}