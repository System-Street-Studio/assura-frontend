import { Component, signal, computed, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { RequestService } from '../../services/requests.service';
import { TransferService } from '../../services/transfer.service';

// Data structure interface
interface TransferData {
  id: string; // This is the record ID for operations
  dbId?: number;
  transferNumber: string;
  assetId: string;
  assetTag: string;
  assetCode: string;
  productName: string;
  assetName: string;
  division: string;
  duration: string;
  requestedBy: string;
  assetNeedTo: string;
  assetNeedToId?: string;
  assetOwner?: string;
  assetOwnerId?: string;
  fromDivisionId: string;
  fromDivisionName: string;
  toDivisionId: string;
  toDivisionName: string;
  requestedByName: string;
  requestedById: string;
  reason: string;
  transferPeriod?: string;
  status: string;
  timeAgo: string;
  image?: string;
  type?: 'Incoming' | 'Outgoing' | 'IncomingActive' | 'OutgoingActive';
  daysLeft?: string;
  acceptedBy?: string;
}

@Component({
  selector: 'app-transfers',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './transfer-page.html',
  styleUrls: ['./transfer-page.css']
})
export class TransferPageComponent implements OnInit, OnDestroy {
  private requestService = inject(RequestService);
  private transferService = inject(TransferService);

  // Component signals
  isLoading = signal(false);
  errorMessage = signal('');
  activeTab = signal<'outgoing' | 'incoming' | 'pending' | 'active' | 'completed'>('outgoing');
  filterType = signal<'all' | 'IncomingActive' | 'OutgoingActive'>('all');
  searchQuery = signal<string>('');
  showMenu = false;

  // Auto-refresh interval
  private refreshInterval: any;

  // Real data store signal
  private allData = signal<TransferData[]>([]);

  ngOnInit(): void {
    console.log('=== APPROVALS TRANSFER PAGE INITIALIZED ===');
    this.loadApprovalTransfers();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  private startAutoRefresh(): void {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
    this.refreshInterval = setInterval(() => {
      this.loadApprovalTransfers();
    }, 30000);
  }

  private stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  loadApprovalTransfers() {
    this.isLoading.set(true);
    
    // Combine multiple sources of transfers for a division head
    this.transferService.getOutgoingTransfersForApproval().subscribe({
      next: (outgoing) => {
        this.transferService.getIncomingTransfersForDivisionHeadApproval().subscribe({
          next: (incoming) => {
            this.transferService.getActiveIncomingTransfersForDivisionHead().subscribe({
              next: (activeIncoming) => {
                this.transferService.getActiveOutgoingTransfersForDivisionHead().subscribe({
                  next: (activeOutgoing) => {
                    const allRaw = [...outgoing, ...incoming, ...activeIncoming, ...activeOutgoing];
                    const mapped = allRaw.map(t => this.mapToLocalFormat(t));
                    this.allData.set(mapped);
                    this.isLoading.set(false);
                  },
                  error: () => this.isLoading.set(false)
                });
              },
              error: () => this.isLoading.set(false)
            });
          },
          error: () => this.isLoading.set(false)
        });
      },
      error: () => this.isLoading.set(false)
    });
  }

  private mapToLocalFormat(t: any): TransferData {
    return {
      id: t.id.toString(),
      dbId: t.id,
      transferNumber: `TRF-${t.id}`,
      assetId: t.assetId?.toString() || 'Unknown',
      assetTag: t.assetTag || 'Unknown',
      assetCode: t.assetCode || `AST-${t.assetId}`,
      productName: t.productName || t.assetName || `Asset ID: ${t.assetId}`,
      assetName: t.assetName || t.productName || 'Unknown Asset',
      division: t.toDivisionName || t.fromDivisionName || 'General',
      duration: 'As requested',
      requestedBy: t.transferredByName || 'Unknown',
      assetNeedTo: t.targetUserName || 'Unknown',
      assetNeedToId: t.targetUserId?.toString(),
      assetOwner: t.currentHolderName || 'Unknown',
      assetOwnerId: t.currentHolderId?.toString(),
      fromDivisionId: t.fromDivisionId?.toString() || 'Unknown',
      fromDivisionName: t.fromDivisionName || 'Unknown',
      toDivisionId: t.toDivisionId?.toString() || 'Unknown',
      toDivisionName: t.toDivisionName || 'Unknown',
      requestedByName: t.transferredByName || 'Unknown',
      requestedById: t.transferredById?.toString() || 'Unknown',
      reason: t.reason || 'No reason provided',
      transferPeriod: this.extractTransferPeriod(t.reason),
      status: this.mapBackendStatus(t.status),
      timeAgo: this.getTimeAgo(t.createdAt),
      daysLeft: this.calculateDaysLeft(t.transferDate),
      acceptedBy: t.acceptedBy || 'Pending',
      type: this.getTransferType(t.status, t.fromDivisionId, t.toDivisionId),
      image: this.getDefaultImage(t.assetCategory || '')
    };
  }

  private mapBackendStatus(backendStatus: string): string {
    const statusMap: { [key: string]: string } = {
      'PendingOwnerApproval': 'Outgoing',
      'PendingOwnerDivisionHeadApproval': 'Incoming',
      'WaitingForFinalConfirmation': 'Approved',
      'ReadyForHandover': 'Confirmed',
      'Active': 'Active',
      'Completed': 'Completed'
    };
    return statusMap[backendStatus] || backendStatus;
  }

  private getTransferType(status: string, fromId: number, toId: number): any {
    if (status !== 'Active') return undefined;
    // Simple logic for demo, in reality check against current user's division
    return fromId < toId ? 'OutgoingActive' : 'IncomingActive';
  }

  private getDefaultImage(category: string): string {
    if (category?.toLowerCase().includes('laptop')) return 'https://tse2.mm.bing.net/th/id/OIP.7L_Ho2CVPF-m88H7_UoM3AHaFS?pid=Api&P=0&h=220';
    return 'https://tse2.mm.bing.net/th/id/OIP.U_KKE5Cp6OVgC8akAAmqPAHaHa?pid=Api&P=0&h=220';
  }

  private getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil(Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  }

  private calculateDaysLeft(transferDate: string): string {
    if (!transferDate) return '';
    const date = new Date(transferDate);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays < 0 ? 'Overdue' : `${diffDays} days`;
  }

  private extractTransferPeriod(reason: string): string {
    if (!reason) return '';
    const patterns = [/\(Transfer periods?:\s*([^)]+)\)/i, /Transfer periods?:\s*(.+?)(?:\n|$)/i];
    for (const pattern of patterns) {
      const match = reason.match(pattern);
      if (match) return match[1].trim();
    }
    return '';
  }

  filteredResults = computed(() => {
    const tab = this.activeTab();
    const typeFilter = this.filterType();
    const query = this.searchQuery().toLowerCase().trim();
    const data = this.allData();

    let filtered = data.filter(i => {
      if (tab === 'incoming') return i.status === 'Incoming';
      if (tab === 'pending') return ['Pending', 'Transfer', 'Transfered', 'Confirmed', 'Approved'].includes(i.status);
      if (tab === 'active') return i.status === 'Active';
      if (tab === 'completed') return i.status === 'Completed';
      if (tab === 'outgoing') return i.status === 'Outgoing';
      return true;
    });

    if ((tab === 'active' || tab === 'completed') && typeFilter !== 'all') {
      const mappedFilter = typeFilter.replace('Active', '');
      filtered = filtered.filter(item => item.type === mappedFilter || item.type === typeFilter);
    }

    if (query) {
      filtered = filtered.filter(item =>
        item.assetName.toLowerCase().includes(query) ||
        item.id.toString().toLowerCase().includes(query)
      );
    }

    return filtered;
  });

  incomingCount = computed(() => this.allData().filter(i => i.status === 'Incoming').length);
  pendingCount = computed(() => this.allData().filter(i => ['Pending', 'Transfer', 'Transfered', 'Confirmed', 'Approved'].includes(i.status)).length);
  activeCount = computed(() => this.allData().filter(i => i.status === 'Active').length);
  completedCount = computed(() => this.allData().filter(i => i.status === 'Completed').length);
  outgoingCount = computed(() => this.allData().filter(i => i.status === 'Outgoing').length);

  onSearchChange(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  setFilterType(type: 'all' | 'IncomingActive' | 'OutgoingActive') {
    this.filterType.set(type);
  }

  setTab(tab: 'incoming' | 'pending' | 'active' | 'completed' | 'outgoing') {
    this.activeTab.set(tab);
  }

  onAccept(id: string) {
    const dbId = parseInt(id, 10);
    if (isNaN(dbId)) return;
    this.requestService.approveRequest(dbId).subscribe({
      next: () => {
        console.log('✅ Approved transfer:', id);
        this.loadApprovalTransfers();
      }
    });
  }

  onReject(id: string) {
    const dbId = parseInt(id, 10);
    if (isNaN(dbId)) return;
    this.requestService.rejectRequest(dbId, 'Rejected by division head').subscribe({
      next: () => {
        console.log('❌ Rejected transfer:', id);
        this.loadApprovalTransfers();
      }
    });
  }
}
