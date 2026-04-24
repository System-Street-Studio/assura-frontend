import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule ,ActivatedRoute} from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { RequestService } from '../../services/requests.service';

@Component({
  selector: 'app-maintenance-details',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './maintenance-details.html',
  styleUrls: ['./maintenance-details.css']
})
export class MaintenanceDetailsComponent implements OnInit {
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
        this.requestService.getRequestById(+id).subscribe((data) => {
          this.request.set(data);
        });
      }
    }
  }

  approveRequest() {
    const id = this.request().id;
    this.requestService.approveRequest(id).subscribe({
      next: () => {
        console.log('Maintenance request approved');
        this.router.navigate(['/approvals/requests']);
      },
      error: (err) => console.error("Approve error:", err)
    });
  }

  rejectRequest() {
    const id = this.request().id;
    this.requestService.rejectRequest(id).subscribe({
      next: () => {
        console.log('Maintenance request rejected');
        this.router.navigate(['/approvals/requests']);
      },
      error: (err) => console.error("Reject error:", err)
    });
  }

  extractIssueType(reason: string): string {
    // Extract issue type from reason (format: "Issue: <type>")
    const match = reason.match(/Issue:\s*(.+)$/);
    return match ? match[1].trim() : reason || 'Not specified';
  }

  close() {
    this.router.navigate(['/approvals/requests']);
    const returnTab = this.route.snapshot.queryParamMap.get('tab') || 'new';
    
    //return to previous tab
    this.router.navigate(['/approvals/requests'], { 
      queryParams: { tab: returnTab } 
    });
  }
}