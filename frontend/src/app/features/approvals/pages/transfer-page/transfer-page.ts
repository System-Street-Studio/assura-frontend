import { Component, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { RequestService } from '../../services/requests.service';
import { TransferService } from '../../services/transfer.service';

// Data structure interface
interface TransferData {
  id: string;
  assetName: string;
  division: string;
  requestedBy: string;
  assetNeedTo: string;
  assetNeedToId?: string;
  reason: string;
  transferPeriod?: string;
  status: 'Incoming' | 'Active' | 'Pending' | 'Approved' | 'Completed' | 'Transfered' | 'Transfer' | 'Confirmed' | 'Incomming Confirmation';
  timeAgo: string;
  image?: string;
  type?: 'Incoming' | 'Outgoing';
  daysLeft?: string;
  acceptedBy?: string;
  assetOwner?: string;
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
  activeTab = signal<'incoming' | 'pending' | 'active' | 'completed' | 'outgoing'>('incoming');
  filterType = signal<'all' | 'Incoming' | 'Outgoing'>('all');
  searchQuery = signal<string>('');
  showMenu = false;

  // Auto-refresh interval
  private refreshInterval: any;

  // Real data store signal
  private allData = signal<TransferData[]>([]);

  constructor(private requestService: RequestService, private transferService: TransferService) {
    // Initialize with backend service
  }

  ngOnInit(): void {
  
    console.log(' Loading all transfers from backend...');
    this.loadUserTransfers();

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
      this.loadUserTransfers();
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
    this.loadUserTransfers();
  }

  loadUserTransfers() {
    
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.transferService.getUserTransfers().subscribe({
      next: (transfers: any[]) => {
        console.log(' === ALL TRANSFERS LOADED (APPROVALS) ===');
        console.log(` Found ${transfers.length} total transfers in database`);
        console.log(' Raw transfers data:', transfers);

        if (transfers.length === 0) {
          console.log(' No transfers found in database');
          this.allData.set([]);
          this.isLoading.set(false);
          return;
        }

        // Convert backend data to local format
        const localData: TransferData[] = transfers.map(transfer => {
          console.log(' === DEBUG TRANSFER DATA ===');
          console.log(' Transfer ID:', transfer.id);
          console.log(' Reason field:', transfer.reason);
          console.log(' Extracted transfer period:', this.extractTransferPeriod(transfer.reason));
          console.log(' Transfer by name:', transfer.transferByName || transfer.targetUserName);
          console.log(' From division head:', transfer.fromDivisionHeadName);
          console.log(' Created at:', transfer.createdAt);
          console.log(' Transfer date:', transfer.transferDate);
          console.log(' Full transfer object:', transfer);

          return {
            id: transfer.id.toString(),
            assetName: `Asset ID: ${transfer.assetId}`,
            division: transfer.fromDivisionName || transfer.fromDivision,
            requestedBy: transfer.fromDivisionHeadName || 'Division Head',
            assetNeedTo: transfer.targetUserName || transfer.targetUser,
            reason: transfer.reason || 'No reason provided',
            transferPeriod: this.extractTransferPeriod(transfer.reason),
            status: this.mapBackendStatus(transfer.status),
            timeAgo: this.getTimeAgo(transfer.createdAt),
            type: this.getUserTransferType(transfer.status, transfer.currentHolderId ?? null, 1),
            daysLeft: this.calculateDaysLeft(transfer.transferDate)
          };
        });

        this.allData.set(localData);
        this.isLoading.set(false);

        console.log(' === TRANSFER DATA CONVERSION COMPLETE ===');
        console.log(` Converted ${localData.length} transfers to local format`);
        console.log(' Sample converted data:', localData.slice(0, 2));
      },
      error: (error) => {
        console.log(' === ERROR LOADING USER TRANSFERS (APPROVALS) ===');
        console.log(' Error details:', error);
        this.errorMessage.set('Failed to load user transfers');
        this.isLoading.set(false);
      }
    });
  }

  // Helper methods
  private mapBackendStatus(backendStatus: string): TransferData['status'] {
    const statusMap: { [key: string]: TransferData['status'] } = {
      'PendingOwnerApproval': 'Incoming',
      'Pending': 'Pending',
      'Active': 'Active',
      'Completed': 'Completed',
      'Transfer': 'Transfer',
      'Transfered': 'Transfered',
      'Confirmed': 'Confirmed',
      'Incomming Confirmation': 'Incomming Confirmation'
    };
    return statusMap[backendStatus] || 'Pending';
  }

  private getUserTransferType(status: string, currentHolderId: number | null, currentUserId: number): 'Incoming' | 'Outgoing' {
    // Simple logic: if current holder is current user, it's outgoing; otherwise incoming
    return currentHolderId === currentUserId ? 'Outgoing' : 'Incoming';
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

    console.log(' === EXTRACTING TRANSFER PERIOD ===');
    console.log(' Original reason:', reason);

    // Try multiple patterns to extract transfer period - prioritize the specific format we see
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
        const extracted = match[1].trim();
        console.log(' Extracted period:', extracted);
        return extracted;
      }
    }

    console.log(' No transfer period found');
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
      filtered = filtered.filter(i => i.type === 'Outgoing');
    }

    // 2. Incoming/Outgoing filter (for Active/Completed tabs)
    if ((tab === 'active' || tab === 'completed') && typeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === typeFilter);
    }

    // 3. Search query filter
    if (query) {
      filtered = filtered.filter(item => 
        item.assetName.toLowerCase().includes(query) || 
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
  outgoingCount = computed(() => this.allData().filter(i => i.type === 'Outgoing').length);

  // Event handlers
  onSearchChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  setFilterType(type: 'all' | 'Incoming' | 'Outgoing') {
    this.filterType.set(type);
  }

  setTab(tab: 'incoming' | 'pending' | 'active' | 'completed' | 'outgoing') {
    this.activeTab.set(tab);
  }

  onAccept(id: string) {
    console.log('Accepted:', id);
    // TODO: implement API call
    // this.apiService.acceptTransfer(id).then(() => {
    //   console.log('Transfer accepted successfully');
    // }).catch((error) => {
    //   console.error('Error accepting transfer:', error);
    // });
  }

  onReject(id: string) {
    console.log('Rejected:', id);
    // TODO: implement API call
    // this.apiService.rejectTransfer(id).then(() => {
    //   console.log('Transfer rejected successfully');
    // }).catch((error) => {
    //   console.error('Error rejecting transfer:', error);
    // });
  }
}
