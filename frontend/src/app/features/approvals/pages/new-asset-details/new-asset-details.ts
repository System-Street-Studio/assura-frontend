import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { RequestService, SuggestedAsset } from '../../services/requests.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { ToastService } from '../../../../shared/services/toast.service';

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
  private toast = inject(ToastService);

  request = signal<any>({});
  processing = signal(false);
  isLoading = signal<boolean>(true);
  error = signal<string>('');
  suggestedAssets = signal<SuggestedAsset[]>([]);
  selectedSuggestedAssetId = signal<number | null>(null);
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
      this.loadSuggestedAssets();
      this.isLoading.set(false);
    } else {
      // Refresh 
      const id = this.route.snapshot.paramMap.get('id');
      console.log("Route ID parameter:", id);
      if (id) {
        console.log("get request by ID:", id);
        this.loadSuggestedAssets(Number(id));
        this.loadRequest(Number(id));
      } else {
        console.warn("No ID found in route");
        this.error.set('No request ID provided');
        this.isLoading.set(false);
      }
    }
  }

  /**
   * This page only ever shows AssetRequests-table records, keyed by that table's own (positive)
   * id — always re-fetch through the dedicated AssetRequests lookup, never the unified
   * /requests/{id} endpoint, which would treat a raw positive id as belonging to the separate
   * Requests table instead. Used both on initial load and after every action below, so the
   * displayed status always reflects what the backend actually persisted rather than an assumed
   * local patch.
   */
  private loadRequest(id: number): void {
    this.requestService.getAssetRequestById(id).subscribe({
      next: (data) => {
        this.request.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Load request by id error:', err);
        this.error.set('Failed to load request details');
        this.isLoading.set(false);
      }
    });
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
        this.loadRequest(id);
        this.popupMessage.set('Request Approved Successfully');
        this.popupType.set('success');
        this.showPopup.set(true);

      },
      error: (err) => {
        this.processing.set(false);
        console.error('Approve error:', err);
        this.toast.error(err?.error?.message || 'Failed to approve request. Please try again.');
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
        this.loadRequest(id);
        this.popupMessage.set('Request Rejected Successfully!');
        this.popupType.set('reject');
        this.showPopup.set(true);

      },
      error: (err) => {
        this.processing.set(false);
        console.error('Reject error:', err);
        this.toast.error(err?.error?.message || 'Failed to reject request. Please try again.');
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
        this.loadRequest(id);
        this.popupMessage.set('Asset reserved temporarily. Waiting for pickup confirmation.');
        this.popupType.set('success');
        this.showPopup.set(true);
      },
      error: (err) => {
        this.processing.set(false);
        console.error('In-stock processing error:', err);
        this.toast.error(err?.error?.message || 'Failed to reserve asset. Please try again.');
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
        this.loadRequest(id);
        this.popupMessage.set('Escalated to procurement successfully.');
        this.popupType.set('success');
        this.showPopup.set(true);
      },
      error: (err) => {
        this.processing.set(false);
        console.error('Out-of-stock processing error:', err);
        this.toast.error(err?.error?.message || 'Failed to escalate to procurement. Please try again.');
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
        this.loadRequest(id);
        this.popupMessage.set('Temporary assignment confirmed and finalized.');
        this.popupType.set('success');
        this.showPopup.set(true);
      },
      error: (err) => {
        this.processing.set(false);
        console.error('Confirm temporary assignment error:', err);
        this.toast.error(err?.error?.message || 'Failed to confirm handover. Please try again.');
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