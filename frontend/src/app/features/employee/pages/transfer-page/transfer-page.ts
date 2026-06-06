import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { TransferService } from '../../services/asset-transfer.service';



// (Interface)
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
  assetCode?: string;
  productName?: string;
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
  transferPeriod?: string;
  createdAt: string;
  updatedAt: string;
}

// (Interface)
interface TransferDataLocal {
  id: number;
  assetTag: string;
  assetCode: string;
  productName: string;
  toDivisionName: string;
  transferByName: string;
  targetUserId: number;
  targetUserName: string;
  currentHolderId?: number;
  reason: string;
<<<<<<< HEAD
  status: 'IncomingActive' | 'OutgoingActive' | 'Pending' | 'Approved' | 'Completed' | 'Active';
=======
  transferPeriod: string;
>>>>>>> feature/division-head-part
  timeAgo: string;
  image?: string;
  type?: 'IncomingActive' | 'OutgoingActive'; 
  daysLeft?: string;
}

@Component({
  selector: 'app-transfers',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './transfer-page.html',
  styleUrl: './transfer-page.css'
})
export class TransferPageComponent implements OnInit {
  // Loading state
  isLoading = signal(false);
  errorMessage = signal('');
  showMenu = signal(false);

  // (Default: incoming)
  activeTab = signal<'incoming' | 'pending' | 'active' | 'completed'>('incoming');

  // Transfer data
  private allTransfers = signal<TransferDataLocal[]>([]);
  
  // Filter and search signals
  filterType = signal<'all' | 'IncomingActive' | 'OutgoingActive'>('all');
  searchQuery = signal<string>('');
  
private transferService = inject(TransferService);
  private authService = inject(AuthService);

<<<<<<< HEAD
  // filteredResults computed logic 
  filteredResults = computed(() => {
    const tab = this.activeTab();
    const typeFilter = this.filterType();
    const query = this.searchQuery().toLowerCase().trim();
    let data = this.allData();

    //  Tab  filter 
    if (tab === 'incoming') data = data.filter(i => i.status === 'IncomingActive');
    else if (tab === 'pending') data = data.filter(i => i.status === 'Pending' || i.status === 'Approved');
    else if (tab === 'active') data = data.filter(i => i.status === 'Active');
    else if (tab === 'completed') data = data.filter(i => i.status === 'Completed');

    //  Incoming/Outgoing filter  apply  (only Active/Completed tabs )
    if ((tab === 'active' || tab === 'completed') && typeFilter !== 'all') {
      const mappedFilter = typeFilter.replace('Active', '');
      data = data.filter(item => item.type === mappedFilter);
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

  // Filter change  function 
  setFilterType(type: 'all' | 'IncomingActive' | 'OutgoingActive') {
    this.filterType.set(type);
  }

  // Summary Counts (Card )
  incomingCount = computed(() => this.allData().filter(i => i.status === 'IncomingActive').length);
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
=======
 
>>>>>>> feature/division-head-part

  ngOnInit(): void {
    this.loadTransfers();
  }

  
  // Tab change function
  setTab(tab: 'incoming' | 'pending' | 'active' | 'completed') {
    this.activeTab.set(tab);
    this.filterType.set('all'); 
    this.loadTransfers();
  }

  loadTransfers() {
    this.isLoading.set(true);
    const currentUserId = this.authService.getUserId();
    if (!currentUserId) {
      this.errorMessage.set('User not authenticated');
      this.isLoading.set(false);
      return;
    }

<<<<<<< HEAD
    // Load incoming transfers (where current user is current holder and status = PendingOwnerApproval)
    console.log('📋 Fetching incoming transfers where current user = current holder and status = PendingOwnerApproval');
    
    this.transferService.getIncomingTransfers().subscribe({
      next: (incomingTransfers: TransferData[]) => {
        console.log('✅ === INCOMING TRANSFERS LOADED ===');
        console.log(`📊 Found ${incomingTransfers.length} incoming transfers for current user`);
        
        // Convert incoming transfers data to local format
        const incomingLocalData: TransferDataLocal[] = incomingTransfers.map(transfer => ({
          id: transfer.id.toString(),
          assetName: transfer.assetName || `Asset ID: ${transfer.assetId}`,
          division: transfer.fromDivisionName,
          duration: this.calculateDuration(transfer.transferDate),
          requestedBy: transfer.transferByName,
          assetNeedTo: transfer.targetUserName,
          reason: transfer.reason || 'No reason provided',
          status: this.mapBackendStatus(transfer.status),
          timeAgo: this.getTimeAgo(transfer.createdAt),
          type: 'Incoming' as const, // All these are incoming transfers
          daysLeft: this.calculateDaysLeft(transfer.transferDate),
          currentHolderId: transfer.currentHolderId,
          targetUserId: transfer.targetUserId
        }));

        // Load other transfers (pending, active, completed) for other tabs
        console.log('📋 Fetching all other transfers for other tabs');
        this.transferService.getUserTransfers().subscribe({
          next: (allTransfers: TransferData[]) => {
            console.log('✅ === ALL OTHER TRANSFERS LOADED ===');
            console.log(`📊 Found ${allTransfers.length} total transfers`);
            
            // Convert all transfers data to local format
            const allLocalData: TransferDataLocal[] = allTransfers.map(transfer => ({
              id: transfer.id.toString(),
              assetName: transfer.assetName || `Asset ID: ${transfer.assetId}`,
              division: transfer.fromDivisionName,
              duration: this.calculateDuration(transfer.transferDate),
              requestedBy: transfer.transferByName,
              assetNeedTo: transfer.targetUserName,
              reason: transfer.reason || 'No reason provided',
              status: this.mapBackendStatus(transfer.status),
              timeAgo: this.getTimeAgo(transfer.createdAt),
              type: this.getUserTransferType(transfer.status, transfer.currentHolderId ?? null, this.getCurrentUserId()),
              daysLeft: this.calculateDaysLeft(transfer.transferDate),
              currentHolderId: transfer.currentHolderId,
              targetUserId: transfer.targetUserId
            }));

            // Combine incoming transfers with other transfers (avoid duplicates)
            const combinedData = [...incomingLocalData];
            
            // Add transfers that are not already in incoming data
            allLocalData.forEach(transfer => {
              if (!combinedData.find(t => t.id === transfer.id)) {
                combinedData.push(transfer);
              }
            });

            this.allData.set(combinedData);
            this.isLoading.set(false);
            
            console.log('📋 Combined transfer data loaded:', combinedData);
            console.log('📊 Transfer status distribution:');
            console.log('  Incoming (PendingOwnerApproval):', combinedData.filter(t => t.status === 'IncomingActive').length);
            console.log('  Pending (Approved):', combinedData.filter(t => t.status === 'Pending').length);
            console.log('  Active:', combinedData.filter(t => t.status === 'Active').length);
            console.log('  Completed:', combinedData.filter(t => t.status === 'Completed').length);
            
            // Display user information for each transfer
            console.log('👤 User Information Display:');
            combinedData.forEach((transfer, index) => {
              console.log(`  ${index + 1}. Transfer ID: ${transfer.id}`);
              console.log(`     Current Holder ID: ${transfer.currentHolderId}`);
              console.log(`     Target User ID: ${transfer.targetUserId}`);
              console.log(`     Status: ${transfer.status}`);
              console.log(`     Asset Name: ${transfer.assetName}`);
            });
          },
          error: (error: any) => {
            console.log('❌ === ERROR LOADING ALL TRANSFERS ===');
            console.log('❌ Failed to load all transfers:', error);
            // Still set incoming data if available
            this.allData.set(incomingLocalData);
            this.isLoading.set(false);
          }
        });
      },
      error: (error: any) => {
        console.log('❌ === ERROR LOADING INCOMING TRANSFERS ===');
        console.log('❌ Failed to load incoming transfers:', error);
        this.errorMessage.set('Failed to load incoming transfers');
=======
    // Backend API Call 
    this.transferService.getTransfers(this.activeTab()).subscribe({
      next: (data: TransferData[]) => {
        const mappedData = data.map(item => this.mapToLocal(item, Number(currentUserId)));
        this.allTransfers.set(mappedData);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading transfers', err);
>>>>>>> feature/division-head-part
        this.isLoading.set(false);
      }
    });
  }
<<<<<<< HEAD

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

  private mapBackendStatus(status: string): 'IncomingActive' | 'OutgoingActive' | 'Active' | 'Pending' | 'Approved' | 'Completed' {
    // Map backend status to frontend status
    switch (status) {
      case '1':
      case 'PendingOwnerApproval':
        return 'IncomingActive';
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
        return 'IncomingActive';
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

  // Tab එchange Function 
  setTab(tab: 'incoming' | 'pending' | 'active' | 'completed') {
    this.activeTab.set(tab);
  }

  // Actions - Backend functionality removed
  onAccept(id: string) {
=======
  // 
  private mapToLocal(item: TransferData, loginUserId: number): TransferDataLocal {
>>>>>>> feature/division-head-part
   
    let userType: 'IncomingActive' | 'OutgoingActive' | undefined;
    
    if (this.activeTab() === 'active' || this.activeTab() === 'completed') {
       
        if (item.targetUserId === loginUserId) {
            userType = 'IncomingActive';
        } 
        
        else if (item.currentHolderId === loginUserId) {
            userType = 'OutgoingActive';
        }
    }

    return {
      id: item.id,
      assetTag: item.assetTag || 'N/A',
      assetCode: item.assetCode || 'N/A',
      productName: item.productName || '',
      toDivisionName: item.toDivisionName,
      transferByName: item.transferByName,
      targetUserId: item.targetUserId,
      targetUserName: item.targetUserName,
      currentHolderId: item.currentHolderId,
      reason: item.reason || '',
      transferPeriod: item.transferPeriod || 'N/A',
      timeAgo: this.calculateTimeAgo(item.createdAt),
      type: userType,
      daysLeft: '3 Days Left' 
    };
  }
  
  // Filter and search logic
  filteredResults = computed(() => {
    let results = this.allTransfers();
    
    
    if (this.activeTab() === 'active' && this.filterType() !== 'all') {
      results = results.filter(t => t.type === this.filterType());
    }
    
    // 2. Search Query Logic
    const query = this.searchQuery().toLowerCase();
    if (query) {
      results = results.filter(t =>
        t.assetTag.toLowerCase().includes(query) ||
        t.assetCode.toLowerCase().includes(query) ||
        t.targetUserName.toLowerCase().includes(query)
      );
    }
    
    return results;
  });

  incomingCount = computed(() => {return this.allTransfers().length; })
  pendingCount = computed(() => {return this.allTransfers().length; })
  activeCount = computed(() => {return this.allTransfers().length; })
  completedCount = computed(() => {return this.allTransfers().length; })

  // Search and filter methods
  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  setFilterType(type: 'all' | 'IncomingActive' | 'OutgoingActive'): void {
    this.filterType.set(type);
    this.showMenu.set(false);
  }

  private calculateTimeAgo(date: string): string {
    
    return 'Just now'; 
  }

  acceptTransfer(id: number) {
  this.transferService.acceptTransfer(id).subscribe({
    next: () => {
      
      this.loadTransfers(); 
      console.log('Status updated successfully');
    },
    error: (err) => {
      console.error('Error updating status', err);
    }
  });
}

  rejectTransfer(id: number) {
    this.transferService.rejectTransfer(id).subscribe({
      next: () => {
        this.loadTransfers();
        console.log('Transfer rejected successfully');
      },
      error: (err) => {
        console.error('Error rejecting transfer', err);
      }
    });
  }
}
