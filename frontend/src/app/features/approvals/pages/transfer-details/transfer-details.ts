import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Location } from '@angular/common';
import { RequestService, SuggestedAsset } from '../../services/requests.service';
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
        this.loadSuggestedAssets(Number(id));
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
  suggestedAssets = signal<SuggestedAsset[]>([]);
  selectedSuggestedAssetId = signal<number | null>(null);

  get requestStatus(): string {
    return (this.request().status || '').toString();
  }

  canDivisionHeadAct(): boolean {
    return this.authService.hasRole(['DivisionHead', 'Admin']) && this.requestStatus === 'PendingDivisionHeadApproval';
  }

  canStorekeeperProcess(): boolean {
    return this.authService.hasRole(['Storekeeper', 'Admin']) && this.requestStatus === 'PendingStorekeeperReview';
  }

  canStorekeeperConfirm(): boolean {
    return this.authService.hasRole(['Storekeeper', 'Admin']) && this.requestStatus === 'TemporaryAssigned';
  }

  loadSuggestedAssets(requestId?: number) {
    const id = requestId ?? Number(this.request().id);
    if (!Number.isFinite(id) || id <= 0 || !this.authService.hasRole(['Storekeeper', 'Admin'])) {
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
    const returnTab = this.route.snapshot.queryParamMap.get('tab') || 'transfer';
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
      type: data.type ?? 'Transfer',
      category: data.type ?? 'Transfer'
    };
  }
}

