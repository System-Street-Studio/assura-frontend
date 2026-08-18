import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule ,ActivatedRoute} from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { RequestService } from '../../services/requests.service';
import { AuthService } from '../../../../core/auth/auth.service';

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
  private authService = inject(AuthService);

  request = signal<any>({});
  isLoading = signal<boolean>(true);
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

   close() {
    const returnTab = this.route.snapshot.queryParamMap.get('tab') || 'discard';
    this.router.navigate(['/approvals/requests'], { queryParams: { tab: returnTab } });
  }

  closePopup() {
    this.showPopup.set(false);
    const returnTab = this.route.snapshot.queryParamMap.get('tab') || 'discard';
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