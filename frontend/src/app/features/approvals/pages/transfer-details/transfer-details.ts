import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Location } from '@angular/common';
import { RequestService } from '../../services/requests.service';
import { AuthService } from '../../../../core/auth/auth.service';


@Component({
  selector: 'app-transfer-asset-details',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './transfer-details.html',
  styleUrls: ['./transfer-details.css']
})
export class TransferDetailsComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute); 
  //private location = inject(Location);
  private requestService = inject(RequestService);
  private authService = inject(AuthService);


 
  request = signal<any>({});
  isLoading = signal<boolean>(true);
  error = signal<string>('');
  isReadOnly = signal<boolean>(false);

  showRejectModal = signal(false);
  rejectReason = signal('');

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
            this.request.set(this.mapRequestForView(data));
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
  processing = signal(false);

  get requestStatus(): string {
    return (this.request().status || '').toString();
  }

  canDivisionHeadAct(): boolean {
    return this.authService.hasRole(['DivisionHead', 'Admin']) && (this.requestStatus === 'PendingDivisionHeadApproval' || this.requestStatus === 'Pending');
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PendingDivisionHeadApproval':
      case 'PendingStorekeeperReview':
      case 'PendingProcurement':
      case 'Pending':
        return 'pending';
      case 'TemporaryAssigned':
        return 'temporary';
      case 'Approved':
        return 'approved';
      case 'Rejected':
        return 'rejected';
      default:
        return 'pending';
    }
  }

  approveRequest() {
    const id = this.request().id;
    if (!id || this.processing()) {
      return;
    }

    this.processing.set(true);

    this.requestService.approveRequest(id).subscribe({
      next: () => {
        this.processing.set(false);
        // ApproveAssetRequestCommand always sets the backend status to Approved —
        // it never transitions through PendingStorekeeperReview/TemporaryAssigned
        // (those belong to a different, New-Asset-only fulfillment path). Once
        // Approved, the request is picked up from the asset-pool screen's
        // "approved transfer requests" list to create the actual Transfer record.
        this.request.set({ ...this.request(), status: 'Approved' });
        this.popupMessage.set('Request Approved Successfully');
        this.popupType.set('success');
        this.showPopup.set(true);

      },
      error: (err) => {
        this.processing.set(false);
        console.error('Approve error:', err);
      }
    });
  }

 
  rejectRequest() {
    const id = this.request().id;
    if (!id || this.processing()) {
      return;
    }
    this.rejectReason.set('');
    this.showRejectModal.set(true);
  }

 
  onRejectReasonChange(event: any) {
    this.rejectReason.set(event.target.value);
  }

  
  closeRejectModal() {
    if (this.processing()) return;
    this.showRejectModal.set(false);
  }

  
  submitRejectTransfer() {
    const id = this.request().id;
    if (!id || this.processing()) {
      return;
    }

    const remarks = this.rejectReason().trim() || undefined;
    this.processing.set(true);

    this.requestService.rejectRequest(id, remarks).subscribe({
      next: () => {
        this.processing.set(false);
        this.showRejectModal.set(false); 
        this.request.set({ ...this.request(), status: 'Rejected' });
        this.popupMessage.set('Request Rejected Successfully!');
        this.popupType.set('reject');
        this.showPopup.set(true);
      },
      error: (err) => {
        this.processing.set(false);
        console.error('Reject error:', err);
      }
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
    const returnTab = this.route.snapshot.queryParamMap.get('tab') || 'transfer';
    this.router.navigate(['/approvals/requests'], { queryParams: { tab: returnTab } });
  }

  closePopup() {
    this.showPopup.set(false);
    
  }

  private mapRequestForView(data: any): any {
    return {
      ...data,
      name: data.requesterName ?? data.name,
      employee: data.requesterId?.toString() ?? data.employee,
      assetName: data.assetName ?? 'N/A',
      division: data.department ?? data.division ?? 'N/A',
      date: data.createdAt ?? data.date,
      specs: data.description ?? data.specs,
      justification: data.description ?? data.justification,
      reason: data.description ?? data.reason,
      type: data.type ?? 'Transfer',
      category: data.type ?? 'Transfer',
      attachments: data.attachments?.length ? data.attachments : []
    };
  }

  //format file sizes
  formatFileSize(bytes?: number): string {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(2)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
  }

  //downloard files
  downloadFile(attachment: any): void {
    if (attachment.fileUrl) {
      const link = document.createElement('a');
      link.href = attachment.fileUrl;
      link.download = attachment.fileName;
      link.click();
    }
  }

  //get file types
  getFileIcon(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    
    const iconMap: { [key: string]: string } = {
      'pdf': 'picture_as_pdf',
      'doc': 'description',
      'docx': 'description',
      'xls': 'table_chart',
      'xlsx': 'table_chart',
      'jpg': 'image',
      'jpeg': 'image',
      'png': 'image',
      'gif': 'image'
    };
    
    return iconMap[ext] || 'attach_file';
  }

}

