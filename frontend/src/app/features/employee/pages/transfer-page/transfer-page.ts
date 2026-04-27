import { Component, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { AssetRequest } from '../../services/asset-request.service';
import { TransferService } from '../../../../features/approvals/services/transfer.service';

// දත්ත වල ව්‍යුහය (Interface)
interface TransferData {
  id: number;
  transferNumber: string;
  transferDate: string;
  returnDate?: string;
  reason: string;
  status: string;
  assetRequestId: number;
  assetId: number;
  assetTag?: string;
  fromDivisionId: number;
  fromDivisionName: string;
  toDivisionId: number;
  toDivisionName: string;
  transferById: number;
  transferByName: string;
  targetUserId: number;
  targetUserName: string;
  currentHolderId?: number;
  currentHolderName?: string;
  createdAt: string;
  updatedAt: string;
}

// දත්ත වල ව්‍යුහය (Interface)
interface TransferDataLocal {
  id: string;
  assetName: string;
  division: string;
  duration: string;
  requestedBy: string;
  assetNeedTo: string;
  reason: string;
  status: 'Incoming' | 'Outgoing' | 'Active' | 'Pending' | 'Approved' | 'Completed';
  timeAgo: string;
  image?: string;
  type?: 'Incoming' | 'Outgoing'; // Active/Completed 
  daysLeft?: string; // Active 
  currentHolderId?: number;
  targetUserId?: number;
}

@Component({
  selector: 'app-transfers',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './transfer-page.html',
  styleUrl: './transfer-page.css'
})
export class TransferPageComponent implements OnInit, OnDestroy {
  // Loading state
  isLoading = signal(false);
  errorMessage = signal('');

  // (Default: incoming)
  activeTab = signal<'incoming' | 'pending' | 'active' | 'completed'>('incoming');

  // Real data will be fetched from API
  private allData = signal<TransferDataLocal[]>([]);

  showMenu = false;
  // Filter state එක සඳහා signal එකක් (Default එක 'all')
  filterType = signal<'all' | 'Incoming' | 'Outgoing'>('all');
  searchQuery = signal<string>('');

  // filteredResults computed logic 
  filteredResults = computed(() => {
    const tab = this.activeTab();
    const typeFilter = this.filterType();
    const query = this.searchQuery().toLowerCase().trim();
    let data = this.allData();

    // මුලින්ම Tab එක අනුව filter කරන්න
    if (tab === 'incoming') data = data.filter(i => i.status === 'Incoming');
    else if (tab === 'pending') data = data.filter(i => i.status === 'Pending' || i.status === 'Approved');
    else if (tab === 'active') data = data.filter(i => i.status === 'Active');
    else if (tab === 'completed') data = data.filter(i => i.status === 'Completed');

    // දැන් Incoming/Outgoing filter එක apply කරන්න (Active/Completed tabs වලදී පමණක්)
    if ((tab === 'active' || tab === 'completed') && typeFilter !== 'all') {
      data = data.filter(item => item.type === typeFilter);
    }

    if (query) {
      data = data.filter(item => 
        item.assetName.toLowerCase().includes(query) || 
        item.id.toLowerCase().includes(query)
      );
    }

    return data;
  });

  onSearchChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  // Filter එක change කරන function එක
  setFilterType(type: 'all' | 'Incoming' | 'Outgoing') {
    this.filterType.set(type);
  }

  // Summary Counts (Card වල පෙන්වීමට)
  incomingCount = computed(() => this.allData().filter(i => i.status === 'Incoming').length);
  pendingCount = computed(() => this.allData().filter(i => i.status === 'Pending' || i.status === 'Approved').length);
  activeCount = computed(() => this.allData().filter(i => i.status === 'Active').length);
  completedCount = computed(() => this.allData().filter(i => i.status === 'Completed').length);

  constructor(private transferService: TransferService) {
    // Initialize with backend service
  }

  private getCurrentUserId(): number {
    // Get current user ID from authentication service
    // In a real app, this would come from authentication service
    // For demo purposes, get user ID from first transfer's currentHolderId or targetUserId
    // TODO: Replace with actual authentication service integration
    const transfers = this.allData();
    if (transfers.length > 0) {
      const firstTransfer = transfers[0];
      return firstTransfer.currentHolderId ?? firstTransfer.targetUserId ?? 1;
    }
    return 1; // Using default user ID for demo - will be dynamic in production
  }

  ngOnDestroy(): void {
    // Cleanup logic if needed
  }

  ngOnInit(): void {
    console.log('🔄 === EMPLOYEE TRANSFER PAGE INITIALIZED ===');
    console.log('📋 Loading all transfers from backend...');
    this.loadUserTransfers();
  }

  loadUserTransfers() {
    console.log('🔄 === LOADING ALL TRANSFERS ===');
    this.isLoading.set(true);
    this.errorMessage.set('');

    console.log('📋 Fetching all transfers from transfer table');
    
    this.transferService.getUserTransfers().subscribe({
      next: (transfers: TransferData[]) => {
        console.log('✅ === ALL TRANSFERS LOADED ===');
        console.log(`📊 Found ${transfers.length} total transfers in database`);
        
        // Convert backend data to local format
        const localData: TransferDataLocal[] = transfers.map(transfer => ({
          id: transfer.id.toString(),
          assetName: `Asset ID: ${transfer.assetId}`,
          division: transfer.fromDivisionName,
          duration: this.calculateDuration(transfer.transferDate),
          requestedBy: transfer.transferByName,
          assetNeedTo: transfer.targetUserName,
          reason: transfer.reason || 'No reason provided',
          status: this.mapBackendStatus(transfer.status),
          timeAgo: this.getTimeAgo(transfer.createdAt),
          type: this.getUserTransferType(transfer.status, transfer.currentHolderId ?? null, 1),
          daysLeft: this.calculateDaysLeft(transfer.transferDate),
          currentHolderId: transfer.currentHolderId,
          targetUserId: transfer.targetUserId
        }));

        this.allData.set(localData);
        this.isLoading.set(false);
        
        console.log('📋 Transferred data to local format:', localData);
        console.log('📊 Transfer status distribution:');
        console.log('  Incoming (PendingOwnerApproval):', localData.filter(t => t.status === 'Incoming').length);
        console.log('  Pending (Approved):', localData.filter(t => t.status === 'Pending').length);
        console.log('  Active:', localData.filter(t => t.status === 'Active').length);
        console.log('  Completed:', localData.filter(t => t.status === 'Completed').length);
        
        // Display user information for each transfer
        console.log('👤 User Information Display:');
        localData.forEach((transfer, index) => {
          console.log(`  ${index + 1}. Transfer ID: ${transfer.id}`);
          console.log(`     Current Holder ID: ${transfer.currentHolderId}`);
          console.log(`     Target User ID: ${transfer.targetUserId}`);
          console.log(`     Status: ${transfer.status}`);
        });
      },
      error: (error) => {
        console.log('❌ === ERROR LOADING USER TRANSFERS ===');
        console.log('❌ Failed to load transfers:', error);
        this.errorMessage.set('Failed to load user transfers');
        this.isLoading.set(false);
      }
    });
  }

  private getUserTransferType(status: string, currentHolderId: number | null, currentUserId: number): 'Incoming' | 'Outgoing' {
    // Determine if transfer is incoming or outgoing based on current holder
    if (currentHolderId != null && currentHolderId === currentUserId) {
      // User is the current holder - this is an incoming transfer TO them
      return 'Incoming';
    } else {
      // User is not the current holder - this is an outgoing transfer FROM them
      return 'Outgoing';
    }
  }

  private mapBackendStatus(status: string): 'Incoming' | 'Outgoing' | 'Active' | 'Pending' | 'Approved' | 'Completed' {
    // Map backend status to frontend status
    switch (status) {
      case '1':
      case 'PendingOwnerApproval':
        return 'Incoming';
      case '2':
      case 'Approved':
        return 'Pending';
      case '3':
      case 'Active':
        return 'Active';
      case '4':
      case 'Completed':
        return 'Completed';
      default:
        return 'Incoming';
    }
  }

  private calculateDuration(transferDate: string): string {
    const date = new Date(transferDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days`;
  }

  private calculateDaysLeft(transferDate: string): string {
    const date = new Date(transferDate);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days left` : 'Overdue';
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

  // Tab එක මාරු කරන Function එක
  setTab(tab: 'incoming' | 'pending' | 'active' | 'completed') {
    this.activeTab.set(tab);
  }

  // Actions - Backend functionality removed
  onAccept(id: string) {
    console.log('Accept functionality removed - will be rebuilt later');
  }

  onReject(id: string) {
    console.log('Reject functionality removed - will be rebuilt later');
  }
}