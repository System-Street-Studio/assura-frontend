import { Component, signal, computed, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { RequestService } from '../../services/requests.service';
import { TransferService } from '../../services/transfer.service';
import { AuthService } from '../../../../core/auth/auth.service';

// Data structure interface
interface TransferData {
  id: string; // This is the record ID for operations
  dbId?: number;
  transferNumber?: string;
  assetId?: string;
  assetTag: string;
  assetCode: string;
  productName: string;
  assetName: string;
  division?: string;
  duration?: string;
  requestedBy?: string;
  assetNeedTo?: string;
  assetNeedToId?: string;
  assetOwner?: string;
  assetOwnerId?: string;
  fromDivisionId?: string | number;
  fromDivisionName?: string;
  toDivisionId?: string | number;
  toDivisionName: string;
  requestedByName: string;
  reason: string;
  transferPeriod?: string;
  status: string;
  timeAgo: string;
  image?: string;
  type?: 'Incoming' | 'Outgoing' | 'IncomingActive' | 'OutgoingActive';
  daysLeft?: string;
  acceptedBy?: string;
  transferByName?: string;
  targetUserName?: string;
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
  private authService = inject(AuthService);

  // Component signals
  isLoading = signal(false);
  errorMessage = signal('');
  activeTab = signal<'outgoing' | 'incoming' | 'pending' | 'active' | 'completed'>('outgoing');
  filterType = signal<'all' | 'IncomingActive' | 'OutgoingActive'>('all');
  searchQuery = signal<string>('');
  showMenu = signal(false);

  private allData = signal<TransferData[]>([]);
  private refreshInterval: any;

  ngOnInit(): void {
    this.loadTransfers();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  private startAutoRefresh(): void {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
    this.refreshInterval = setInterval(() => {
      this.loadTransfers();
    }, 30000);
  }

  private stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  loadTransfers() {
    this.isLoading.set(true);
    const userDivisionId = this.authService.getDivisionId();

    this.transferService.getDivisionHeadTransfers(this.activeTab()).subscribe({
      next: (data) => {
        const mapped = data.map(item => ({
          ...item,
          id: item.id.toString(),
          timeAgo: 'Just now', 
          type: (this.activeTab() === 'active' || this.activeTab() === 'completed') 
                ? (item.toDivisionId === userDivisionId ? 'IncomingActive' : 'OutgoingActive') 
                : undefined
        }));
        this.allData.set(mapped);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  setTab(tab: 'outgoing' | 'incoming' | 'pending' | 'active' | 'completed') {
    this.activeTab.set(tab);
    this.filterType.set('all'); 
    this.loadTransfers();
  }

  approveTransfer(id: string) {
    this.transferService.approveByHead(Number(id)).subscribe(() => this.loadTransfers());
  }

  confirmTransfer(id: string) {
    this.transferService.confirmByHead(Number(id)).subscribe(() => this.loadTransfers());
  }

  rejectTransfer(id: string, reason?: string) {
    this.transferService.rejectByHead(Number(id), reason || 'No reason provided').subscribe(() => this.loadTransfers());
  }

  setFilterType(type: 'all' | 'IncomingActive' | 'OutgoingActive') {
    this.filterType.set(type);
    this.showMenu.set(false);
  }

  onSearchChange(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  // Computed properties for filtered results and counts
  filteredResults = computed(() => {
    let results = this.allData();
    
    // Apply active tab filter for incoming/active transfers
    if ((this.activeTab() === 'active' || this.activeTab() === 'completed') && this.filterType() !== 'all') {
      results = results.filter(t => t.type === this.filterType());
    }
    
    // Apply search query filter
    const query = this.searchQuery().toLowerCase();
    if (query) {
      results = results.filter(t =>
        t.assetTag?.toLowerCase().includes(query) ||
        t.assetCode?.toLowerCase().includes(query) ||
        t.productName?.toLowerCase().includes(query) ||
        t.requestedByName?.toLowerCase().includes(query)
      );
    }
    
    return results;
  });

  incomingCount = computed(() => {
    if (this.activeTab() === 'incoming') return this.allData().length;
    return 0;
  });
 
  outgoingCount = computed(() => this.allData().length);
  pendingCount = computed(() => this.activeTab() === 'pending' ? this.allData().length : 0);
  activeCount = computed(() => this.activeTab() === 'active' ? this.allData().length : 0);
  completedCount = computed(() => this.activeTab() === 'completed' ? this.allData().length : 0);

  onAccept(id: string) {
    this.approveTransfer(id);
  }

  onReject(id: string) {
    this.rejectTransfer(id);
  }
}
