import { Component, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { TransferService } from '../../services/transfer.service';
import { AuthService } from '../../../../core/auth/auth.service';

// Data structure interface
interface TransferData {
  id: string;
  assetTag: string;
  assetCode: string;
  productName: string;
  assetNeedTo: string;
  assetNeedToId?: string;
  assetOwner: string;
  toDivisionName: string;
  fromDivisionId: number;
  toDivisionId: number;
  requestedByName: string;
  reason: string;
  transferPeriod?: string;
  status: string;
  timeAgo: string;
  type?: 'IncomingActive' | 'OutgoingActive';
  daysLeft?: string;
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
  activeTab = signal<'outgoing' | 'incoming' | 'pending' | 'active' | 'completed'>('outgoing');
  filterType = signal<'all' | 'IncomingActive' | 'OutgoingActive'>('all');
  searchQuery = signal<string>('');
  showMenu = signal(false);


  private allData = signal<TransferData[]>([]);
  private refreshInterval: any;

  constructor(
    private transferService: TransferService,
    private authService: AuthService 
  ) {}

  ngOnInit(): void {
    this.loadTransfers();
    
    this.refreshInterval = setInterval(() => this.loadTransfers(), 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
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
        t.assetTag.toLowerCase().includes(query) ||
        t.assetCode.toLowerCase().includes(query) ||
        t.productName.toLowerCase().includes(query) ||
        t.requestedByName.toLowerCase().includes(query)
      );
    }
    
    return results;
  });

  incomingCount = computed(() => {
    // Count for incoming approvals tab
    if (this.activeTab() === 'incoming') {
      return this.allData().length;
    }
    return 0;
  });
 
  outgoingCount = computed(() => this.allData().length);

 

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

  

}
