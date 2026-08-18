import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { RequestService, SuggestedAsset } from '../../services/requests.service';
import { AuthService } from '../../../../core/auth/auth.service';

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
  private authService = inject(AuthService);

  request = signal<any>({});
  processing = signal(false);
  isLoading = signal<boolean>(true);
  error = signal<string>('');
  suggestedAssets = signal<SuggestedAsset[]>([]);
  selectedSuggestedAssetId = signal<number | null>(null);
  isReadOnly = signal<boolean>(false);

  // Reject Modal සඳහා අවශ්‍ය signals
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
      this.loadSuggestedAssets();
      this.isLoading.set(false);
    } else {
      // Refresh 
      const id = this.route.snapshot.paramMap.get('id');
      console.log("Route ID parameter:", id);
      if (id) {
        console.log("get request by ID:", id);
        this.loadSuggestedAssets(Number(id));
        this.requestService.getRequestById(+id).subscribe({
          next: (data) => {
            console.log("Data fetched:", data);
            this.request.set(this.mapRequestForView(data));
            this.isLoading.set(false);
          },
          error: (err) => {
            console.error('Load request by id error:', err);
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

  get requestStatus(): string {
    return (this.request().status || '').toString();
  }

  isDivisionHeadView(): boolean {
    return this.authService.hasRole(['DivisionHead', 'Admin']);
  }

  isStorekeeperView(): boolean {
    return this.authService.hasRole(['Storekeeper', 'Admin']);
  }

  canDivisionHeadAct(): boolean {
    return this.isDivisionHeadView() && (this.requestStatus === 'PendingDivisionHeadApproval' || this.requestStatus === 'Pending');
  }

  canStorekeeperProcess(): boolean {
    return this.isStorekeeperView() && this.requestStatus === 'PendingStorekeeperReview';
  }

  canStorekeeperConfirm(): boolean {
    return this.isStorekeeperView() && this.requestStatus === 'TemporaryAssigned';
  }

  loadSuggestedAssets(requestId?: number) {
    const id = requestId ?? Number(this.request().id);
    if (!Number.isFinite(id) || id <= 0 || !this.isStorekeeperView()) {
      this.suggestedAssets.set([]);
      this.selectedSuggestedAssetId.set(null);
      return;
    }

    this.requestService.getSuggestedAssetsForRequest(id).subscribe({
      next: (assets) => {
        this.suggestedAssets.set(assets || []);
        this.selectedSuggestedAssetId.set((assets && assets.length > 0) ? assets[0].id : null);
      },
      error: (err) => {
        console.error('Suggested assets load error:', err);
        this.suggestedAssets.set([]);
        this.selectedSuggestedAssetId.set(null);
      }
    });
  }

  selectSuggestedAsset(assetId: number) {
    this.selectedSuggestedAssetId.set(assetId);
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
        this.request.set({ ...this.request(), status: 'PendingStorekeeperReview' });
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

  processInStock() {
    const id = this.request().id;
    if (!id || this.processing()) {
      return;
    }

    const assetId = this.selectedSuggestedAssetId() ?? Number(this.request().assetId);
    if (!Number.isFinite(assetId) || assetId <= 0) {
      window.alert('Please select a suggested asset first.');
      return;
    }

    const remarks = window.prompt('Storekeeper note (optional):') ?? undefined;

    this.processing.set(true);
    this.requestService.processByStorekeeper(id, true, assetId, remarks).subscribe({
      next: () => {
        this.processing.set(false);
        this.request.set({ ...this.request(), status: 'TemporaryAssigned', assetId });
        this.popupMessage.set('Asset reserved temporarily. Waiting for pickup confirmation.');
        this.popupType.set('success');
        this.showPopup.set(true);
      },
      error: (err) => {
        this.processing.set(false);
        console.error('In-stock processing error:', err);
      }
    });
  }

  processOutOfStock() {
    const id = this.request().id;
    if (!id || this.processing()) {
      return;
    }

    const remarks = window.prompt('Procurement escalation reason:') ?? undefined;
    this.processing.set(true);
    this.requestService.processByStorekeeper(id, false, undefined, remarks).subscribe({
      next: () => {
        this.processing.set(false);
        this.request.set({ ...this.request(), status: 'PendingProcurement' });
        this.popupMessage.set('Escalated to procurement successfully.');
        this.popupType.set('success');
        this.showPopup.set(true);
      },
      error: (err) => {
        this.processing.set(false);
        console.error('Out-of-stock processing error:', err);
      }
    });
  }

  confirmTemporaryAssignment() {
    const id = this.request().id;
    if (!id || this.processing()) {
      return;
    }

    const remarks = window.prompt('Handover confirmation note (optional):') ?? undefined;
    this.processing.set(true);
    this.requestService.confirmTemporaryAssignment(id, remarks).subscribe({
      next: () => {
        this.processing.set(false);
        this.request.set({ ...this.request(), status: 'Approved' });
        this.popupMessage.set('Temporary assignment confirmed and finalized.');
        this.popupType.set('success');
        this.showPopup.set(true);
      },
      error: (err) => {
        this.processing.set(false);
        console.error('Confirm temporary assignment error:', err);
      }
    });
  }


  close() {
    this.router.navigate(['approvals/requests']); // navigate to the requests page
  }

  closePopup() {
    this.showPopup.set(false);
    const returnTab = this.route.snapshot.queryParamMap.get('tab') || 'new';
    this.router.navigate(['approvals/requests'], { queryParams: { tab: returnTab } });
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
      type: data.type ?? 'Asset',
      category: data.type ?? 'Asset',
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