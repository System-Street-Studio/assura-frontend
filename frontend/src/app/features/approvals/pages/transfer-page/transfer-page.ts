import { Component, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { TransferService } from '../../services/transfer.service';

// Data structure interface
interface TransferData {
  id: string;
  transferNumber:string;
  assetId:string;
  assetTag:string;
  assetCode:string;
  productName: string;
  assetNeedTo: string;
  assetNeedToId?: string;
  assetOwner?: string;
  assetOwnerId?: string;
  fromDivisionId: string;
  fromDivisionName:string;
  toDivisionId: string;
  toDivisionName:string;
  requestedByName: string;
  requestedById: string;
  reason: string;
  transferPeriod?: string;
  status: 'Outgoing' | 'Incoming' | 'Active' | 'Pending' | 'Approved' | 'Completed' | 'Confirmed' | 'Transfer' | 'Transfered';
  timeAgo: string;
  image?: string;
  type?: 'IncomingActive' | 'OutgoingActive';
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
  // Component signals
  isLoading = signal(false);
  errorMessage = signal('');
  activeTab = signal<'outgoing'|'incoming' | 'pending' | 'active' | 'completed'>('outgoing');
  filterType = signal<'all' | 'IncomingActive' | 'OutgoingActive'>('all');
  searchQuery = signal<string>('');
  showMenu = false;

  // Auto-refresh interval
  private refreshInterval: any;

  // Real data store signal
  private allData = signal<TransferData[]>([]);

  constructor( private transferService: TransferService) {
    // Initialize with backend service
  }

  ngOnInit(): void {
    console.log('=== APPROVALS TRANSFER PAGE INITIALIZED ===');
    console.log('Loading transfers with specific filtering criteria...');
    this.loadApprovalTransfers();

    // Start auto-refresh every 30 seconds
    this.startAutoRefresh();
  }

  // Auto-refresh functionality
  private startAutoRefresh(): void {
    console.log('Starting auto-refresh every 30 seconds');
    
    // Clear any existing interval
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    
    // Set up new interval to refresh every 30 seconds
    this.refreshInterval = setInterval(() => {
      console.log(' Auto-refreshing transfer data...');
      //this.loadUserTransfers();
    }, 30000); // 30 seconds
  }

  private stopAutoRefresh(): void {
    console.log(' Stopping auto-refresh');
    
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  ngOnDestroy(): void {
    console.log(' Cleaning up transfer page component');
    
    // Clean up auto-refresh interval
    this.stopAutoRefresh();
  }

  refreshTransfers(): void {
   
    console.log(' Force reloading all transfers from backend...');
    //this.loadUserTransfers();
  }

  // Load transfers with specific filtering for approvals
  loadApprovalTransfers() {
    console.log('=== LOADING APPROVAL TRANSFERS ===');
    this.isLoading.set(true);
    this.errorMessage.set('');

    // Load outgoing transfers (status=PendingOwnerApproval & current user=transferredBy)
    console.log('Loading outgoing transfers for approval...');
    this.transferService.getOutgoingTransfersForApproval().subscribe({
      next: (outgoingTransfers: any[]) => {
        console.log('=== OUTGOING TRANSFERS LOADED ===');
        console.log(`Found ${outgoingTransfers.length} outgoing transfers for approval`);

        // Load incoming transfers (status=PendingOwnerDivisionHeadApproval & current user=currentHolder division head)
        console.log('Loading incoming transfers for division head approval...');
        this.transferService.getIncomingTransfersForDivisionHeadApproval().subscribe({
          next: (incomingTransfers: any[]) => {
            console.log('=== INCOMING DIVISION HEAD TRANSFERS LOADED ===');
            console.log(`Found ${incomingTransfers.length} incoming transfers for division head approval`);

            // Load active transfers for division heads
            console.log('Loading active transfers for division heads...');
            this.loadActiveTransfers(outgoingTransfers, incomingTransfers);
          },
          error: (error) => {
            console.log('=== ERROR LOADING INCOMING TRANSFERS ===');
            console.log('Error details:', error);
            this.errorMessage.set('Failed to load incoming transfers');
            this.isLoading.set(false);
          }
        });
      },
      error: (error) => {
        console.log('=== ERROR LOADING OUTGOING TRANSFERS ===');
        console.log('Error details:', error);
        this.errorMessage.set('Failed to load outgoing transfers');
        this.isLoading.set(false);
      }
    });
  }

  // Load active transfers for division heads
  private loadActiveTransfers(outgoingTransfers: any[], incomingTransfers: any[]) {
    // Load active incoming transfers (status=Active & current user=toDivision division head)
    this.transferService.getActiveIncomingTransfersForDivisionHead().subscribe({
      next: (activeIncomingTransfers: any[]) => {
        console.log('=== ACTIVE INCOMING TRANSFERS LOADED ===');
        console.log(`Found ${activeIncomingTransfers.length} active incoming transfers`);

        // Load active outgoing transfers (status=Active & current user=fromDivision division head)
        this.transferService.getActiveOutgoingTransfersForDivisionHead().subscribe({
          next: (activeOutgoingTransfers: any[]) => {
            console.log('=== ACTIVE OUTGOING TRANSFERS LOADED ===');
            console.log(`Found ${activeOutgoingTransfers.length} active outgoing transfers`);

            // Combine all transfer types
            const allTransfers = [
              ...outgoingTransfers, 
              ...incomingTransfers, 
              ...activeIncomingTransfers, 
              ...activeOutgoingTransfers
            ];
            console.log(`Combined total: ${allTransfers.length} transfers`);

            // Convert backend data to local format
            const transferData: TransferData[] = allTransfers.map(transfer => {
              console.log('=== DEBUG TRANSFER DATA ===');
              console.log('Transfer ID:', transfer.id);
              console.log('Status:', transfer.status);
              console.log('TransferredBy:', transfer.transferredByName);
              console.log('CurrentHolder:', transfer.currentHolderName);

              return {
                id: transfer.id.toString(),
                transferNumber: `TRF-${transfer.id}`,
                assetId: transfer.assetId?.toString() || 'Unknown',
                assetTag: transfer.assetTag || 'Unknown',
                assetCode: transfer.assetCode || `AST-${transfer.assetId}`,
                productName: transfer.productName || transfer.assetName || `Asset ID: ${transfer.assetId}`,
                assetNeedTo: transfer.targetUserName || 'Unknown',
                assetNeedToId: transfer.targetUserId?.toString(),
                assetOwner: transfer.currentHolderName || 'Unknown',
                assetOwnerId: transfer.currentHolderId?.toString(),
                fromDivisionId: transfer.fromDivisionId?.toString() || 'Unknown',
                fromDivisionName: transfer.fromDivisionName || 'Unknown',
                toDivisionId: transfer.toDivisionId?.toString() || 'Unknown',
                toDivisionName: transfer.toDivisionName || 'Unknown',
                requestedByName: transfer.transferredByName || 'Unknown',
                requestedById: transfer.transferredById?.toString() || 'Unknown',
                reason: transfer.reason || 'No reason provided',
                transferPeriod: this.extractTransferPeriod(transfer.reason),
                status: this.mapBackendStatus(transfer.status),
                timeAgo: this.getTimeAgo(transfer.createdAt),
                daysLeft: this.calculateDaysLeft(transfer.transferDate),
                acceptedBy: transfer.acceptedBy,
                type: this.getTransferType(transfer.status, transfer.fromDivisionId, transfer.toDivisionId)
              };
            });

            this.allData.set(transferData);
            this.isLoading.set(false);

            console.log('=== TRANSFER DATA CONVERSION COMPLETE ===');
            console.log(`Converted ${transferData.length} transfers to local format`);
            console.log('Transfer status distribution:');
            console.log('  Outgoing (PendingOwnerApproval):', transferData.filter(t => t.status === 'Outgoing').length);
            console.log('  Incoming (PendingOwnerDivisionHeadApproval):', transferData.filter(t => t.status === 'Incoming').length);
            console.log('  Active:', transferData.filter(t => t.status === 'Active').length);
            console.log('Sample converted data:', transferData.slice(0, 2));
          },
          error: (error) => {
            console.log('=== ERROR LOADING ACTIVE OUTGOING TRANSFERS ===');
            console.log('Error details:', error);
            // Still load what we have without active outgoing transfers
            this.finalizeTransferData(outgoingTransfers, incomingTransfers, activeIncomingTransfers, []);
          }
        });
      },
      error: (error) => {
        console.log('=== ERROR LOADING ACTIVE INCOMING TRANSFERS ===');
        console.log('Error details:', error);
        // Still load what we have without active transfers
        this.finalizeTransferData(outgoingTransfers, incomingTransfers, [], []);
      }
    });
  }

  // Finalize transfer data processing
  private finalizeTransferData(outgoingTransfers: any[], incomingTransfers: any[], activeIncomingTransfers: any[], activeOutgoingTransfers: any[]) {
    const allTransfers = [
      ...outgoingTransfers, 
      ...incomingTransfers, 
      ...activeIncomingTransfers, 
      ...activeOutgoingTransfers
    ];
    console.log(`Combined total: ${allTransfers.length} transfers`);

    // Convert backend data to local format
    const transferData: TransferData[] = allTransfers.map(transfer => {
      return {
        id: transfer.id.toString(),
        transferNumber: `TRF-${transfer.id}`,
        assetId: transfer.assetId?.toString() || 'Unknown',
        assetTag: transfer.assetTag || 'Unknown',
        assetCode: transfer.assetCode || `AST-${transfer.assetId}`,
        productName: transfer.productName || transfer.assetName || `Asset ID: ${transfer.assetId}`,
        assetNeedTo: transfer.targetUserName || 'Unknown',
        assetNeedToId: transfer.targetUserId?.toString(),
        assetOwner: transfer.currentHolderName || 'Unknown',
        assetOwnerId: transfer.currentHolderId?.toString(),
        fromDivisionId: transfer.fromDivisionId?.toString() || 'Unknown',
        fromDivisionName: transfer.fromDivisionName || 'Unknown',
        toDivisionId: transfer.toDivisionId?.toString() || 'Unknown',
        toDivisionName: transfer.toDivisionName || 'Unknown',
        requestedByName: transfer.transferredByName || 'Unknown',
        requestedById: transfer.transferredById?.toString() || 'Unknown',
        reason: transfer.reason || 'No reason provided',
        transferPeriod: this.extractTransferPeriod(transfer.reason),
        status: this.mapBackendStatus(transfer.status),
        timeAgo: this.getTimeAgo(transfer.createdAt),
        daysLeft: this.calculateDaysLeft(transfer.transferDate),
        acceptedBy: transfer.acceptedBy,
        type: this.getTransferType(transfer.status, transfer.fromDivisionId, transfer.toDivisionId)
      };
    });

    this.allData.set(transferData);
    this.isLoading.set(false);

    console.log('=== TRANSFER DATA CONVERSION COMPLETE ===');
    console.log(`Converted ${transferData.length} transfers to local format`);
  }

  // Determine transfer type for active transfers
  private getTransferType(status: string, fromDivisionId: number, toDivisionId: number): 'IncomingActive' | 'OutgoingActive' | undefined {
    if (status !== 'Active') return undefined;
    
    // This would need to be based on current user's division head role
    // For now, we'll use a simple logic based on division IDs
    // In a real implementation, this would check if current user is division head of from/to division
    return fromDivisionId < toDivisionId ? 'OutgoingActive' : 'IncomingActive';
  }

  // Helper methods
  private mapBackendStatus(backendStatus: string): TransferData['status'] {
    const statusMap: { [key: string]: TransferData['status'] } = { 
    'PendingOwnerApproval':'Outgoing', 
    'PendingOwnerDivisionHeadApproval': 'Incoming',
    'WaitingForFinalConfirmation': 'Approved',
    'ReadyForHandover': 'Confirmed',
    'Active': 'Active',
    'Completed': 'Completed',
    'Transfer': 'Active',
    'Transfered': 'Completed'
    };
    return statusMap[backendStatus] || 'Outgoing';
  }

 

  private getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  }

  private calculateDaysLeft(transferDate: string): string {
    const date = new Date(transferDate);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days`;
  }

  private extractTransferPeriod(reason: string): string {
    if (!reason) return '';

    // Try multiple patterns to extract transfer period
    const patterns = [
      /\(Transfer periods?:\s*([^)]+)\)/i,  // "(Transfer periods: 4/25/2026 to 4/28/2026)"
      /Transfer periods?:\s*(.+?)(?:\n|$)/i,
      /Transfer period\s*[:\-]?\s*(.+?)(?:\n|$)/i,
      /Period\s*:?\s*(.+?)(?:\n|$)/i,
      /Duration\s*:?\s*(.+?)(?:\n|$)/i,
      /For\s*(.+?)(?:\n|$)/i,
      /(.+?)\s+transfer/i
    ];

    for (const pattern of patterns) {
      const match = reason.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return '';
  }

  

  // Filtered logic (Computed signal for better performance)
  filteredResults = computed(() => {
    const tab = this.activeTab();
    const typeFilter = this.filterType();
    const query = this.searchQuery().toLowerCase().trim();
    const data = this.allData();

    let filtered = [...data];

    // 1. Filter by tab
    if (tab === 'incoming') {
      filtered = filtered.filter(i => i.status === 'Incoming');
    } else if (tab === 'pending') {
      filtered = filtered.filter(i => ['Pending', 'Transfer', 'Transfered', 'Confirmed', 'Incomming Confirmation'].includes(i.status));
    } else if (tab === 'active') {
      filtered = filtered.filter(i => i.status === 'Active');
    } else if (tab === 'completed') {
      filtered = filtered.filter(i => i.status === 'Completed');
    } else if (tab === 'outgoing') {
      filtered = filtered.filter(i => i.status === 'Outgoing');
    }

    // 2. Incoming/Outgoing filter (for Active/Completed tabs)
    if ((tab === 'active' || tab === 'completed') && typeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === typeFilter);
    }

    // 3. Search query filter
    if (query) {
      filtered = filtered.filter(item => 
        item.assetCode.toLowerCase().includes(query) || 
        item.id.toLowerCase().includes(query)
      );
    }

    return filtered;
  });

  // Summary counts
  incomingCount = computed(() => this.allData().filter(i => i.status === 'Incoming').length);
  pendingCount = computed(() => this.allData().filter(i => ['Pending', 'Transfer', 'Transfered', 'Confirmed', 'Incomming Confirmation'].includes(i.status)).length);
  activeCount = computed(() => this.allData().filter(i => i.status === 'Active').length);
  completedCount = computed(() => this.allData().filter(i => i.status === 'Completed').length);
  outgoingCount = computed(() => this.allData().filter(i => i.status === 'Outgoing').length);

  // Event handlers
  onSearchChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  setFilterType(type: 'all' | 'IncomingActive' | 'OutgoingActive') {
   this.filterType.set(type);
  }

  setTab(tab: 'incoming' | 'pending' | 'active' | 'completed' | 'outgoing') {
    this.activeTab.set(tab);
  }

  onAccept(id: string) {
    console.log('Accepted:', id);
  
    // this.apiService.acceptTransfer(id).then(() => {
    //   console.log('Transfer accepted successfully');
    // }).catch((error) => {
    //   console.error('Error accepting transfer:', error);
    // });
  }

  onReject(id: string) {
    console.log('Rejected:', id);
   
    // this.apiService.rejectTransfer(id).then(() => {
    //   console.log('Transfer rejected successfully');
    // }).catch((error) => {
    //   console.error('Error rejecting transfer:', error);
    // });
  }
}
