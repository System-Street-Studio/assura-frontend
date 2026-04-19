import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule ,ActivatedRoute} from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { RequestService } from '../../services/requests.service';

@Component({
  selector: 'app-discard-details',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './discard-details.html',
  styleUrls: ['./discard-details.css']
})
export class DiscardDetailsComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private requestService = inject(RequestService);

  request = signal<any>({});

  ngOnInit() {
    // Service handling
    if (this.requestService.selectedRequest) {
      console.log("received data from Service");
      this.request.set(this.requestService.selectedRequest);
    } else {
      // Refresh
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        console.log("get request by ID:", id);
        /* this.requestService.getRequestById(+id).subscribe((data) => {
          this.request.set(data);
        }); */
      }
    }
  }

  approveRequest() {
    const id = this.request().id;
    this.requestService.approveRequest(id).subscribe({
      next: () => {
        console.log('Discard request approved');
        this.router.navigate(['/approvals/requests']);
      },
      error: (err) => console.error("Approve error:", err)
    });
  }

  rejectRequest() {
    const id = this.request().id;
    this.requestService.rejectRequest(id).subscribe({
      next: () => {
        console.log('Discard request rejected');
        this.router.navigate(['/approvals/requests']);
      },
      error: (err) => console.error("Reject error:", err)
    });
  }

  close() {
    const returnTab = this.route.snapshot.queryParamMap.get('tab') || 'new';
    this.router.navigate(['/approvals/requests'], { 
      queryParams: { tab: returnTab } 
    });
  }
}