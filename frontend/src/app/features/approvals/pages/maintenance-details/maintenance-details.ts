import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule ,ActivatedRoute} from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { RequestService } from '../../services/requests.service';
import { AuthService } from '../../../../core/auth/auth.service';

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
  private authService = inject(AuthService);

  request = signal<any>({});
  isReadOnly = signal<boolean>(false);
  processing = signal(false);

  ngOnInit() {
    // Check for readOnly query parameter — same pattern as transfer-details.
    const readOnly = this.route.snapshot.queryParamMap.get('readOnly');
    this.isReadOnly.set(readOnly === 'true');

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

  showPopup = signal(false);
  popupMessage = signal('');
  popupType = signal<'success' | 'reject'>('success');

  get requestStatus(): string {
    return (this.request().status || '').toString();
  }

  // Same status/role gate as transfer-details.ts's canDivisionHeadAct(): only a
  // Division Head/Admin may decide a request, and only while it's still pending —
  // otherwise an already-approved/rejected request could be re-decided.
  canDivisionHeadAct(): boolean {
    return this.authService.hasRole(['DivisionHead', 'Admin'])
      && (this.requestStatus === 'PendingDivisionHeadApproval' || this.requestStatus === 'Pending');
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
        this.request.set({ ...this.request(), status: 'Approved' });
        this.popupMessage.set('Request Approved Successfully');
        this.popupType.set('success');
        this.showPopup.set(true);
      },
      error: (err) => {
        this.processing.set(false);
        console.error("Approve error:", err);
      }
    });
  }

  rejectRequest() {
    const id = this.request().id;
    if (!id || this.processing()) {
      return;
    }

    const remarks = window.prompt('Reason for rejection (optional):') ?? undefined;
    this.processing.set(true);
    this.requestService.rejectRequest(id, remarks).subscribe({
      next: () => {
        this.processing.set(false);
        this.request.set({ ...this.request(), status: 'Rejected' });
        this.popupMessage.set('Request Rejected Successfully!');
        this.popupType.set('reject');
        this.showPopup.set(true);
      },
      error: (err) => {
        this.processing.set(false);
        console.error("Reject error:", err);
      }
    });
  }

  extractIssueType(reason: string): string {
    // Extract issue type from reason (format: "Issue: <type>")
    const match = reason.match(/Issue:\s*(.+)$/);
    return match ? match[1].trim() : reason || 'Not specified';
  }

  close() {
    const returnTab = this.route.snapshot.queryParamMap.get('tab') || 'maintenance';
    this.router.navigate(['/approvals/requests'], { queryParams: { tab: returnTab } });
  }

  closePopup() {
    this.showPopup.set(false);
    const returnTab = this.route.snapshot.queryParamMap.get('tab') || 'maintenance';
    this.router.navigate(['approvals/requests'], { queryParams: { tab: returnTab } });
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