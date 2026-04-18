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
  private route = inject(ActivatedRoute); // මේ line එක අනිවාර්යයෙන් එක් කරන්න
  private location = inject(Location);
  private requestService = inject(RequestService);
  private authService = inject(AuthService);

  // Navigation state එකෙන් එන දත්ත ලබා ගැනීම
  request = signal<any>(history.state.data || {/*
    asset: 'Table',
    category: 'Furniture',
    quantity: 1,
    name: 'Jenny Athapaththu (ID:EST001)',
    submittedDate: '15-08-2025',
    timelineFrom: '15-08-2025',
    timelineTo: '15-09-2025',
    specs: 'Height: 28-30 inches \n Width: 40-72 inches \n Depth: 24-32 inches',
    reason: 'my table is discarded and need another for temporary use until new table received.'*/
  });

  ngOnInit() {
    // 1. Service එකේ ඇති දත්ත පරීක්ෂා කිරීම
    if (this.requestService.selectedRequest) {
      this.request.set(this.requestService.selectedRequest);
      this.loadSuggestedAssets();
    } else {
      // 2. Refresh වුවහොත් URL එකෙන් ID එක ගෙන API call එකක් යැවීම
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.loadSuggestedAssets(Number(id));
        this.requestService.getRequestById(+id).subscribe({
          next: (data) => {
            this.request.set(this.mapRequestForView(data));
          },
          error: (err) => {
            console.error('Load request by id error:', err);
          }
        });
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


  viewInPool() { console.log('Viewing in Pool'); }

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

