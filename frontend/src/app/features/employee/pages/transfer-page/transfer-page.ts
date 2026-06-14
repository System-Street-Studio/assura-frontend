import { Component, signal, computed, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { EmployeeTransferService } from '../../services/asset-transfer.service';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';

interface TransferData {
  id: string;
  transferNumber: string;
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
  transferDate: any; 
  returnDate: any;
  createdAt: string;
  updatedAt: string;
}

interface TransferDataLocal {
  id: string;
  assetTag: string;
  assetCode: string;
  productName: string;
  toDivisionName: string;
  fromDivisionName: string;
  transferByName: string;
  targetUserId: number;
  targetUserName: string;
  currentHolderId?: number;
  currentHolderName?: string;
  reason: string;
  transferPeriod: string;
  status: string;
  timeAgo: string;
  image?: string;
  type?: 'IncomingActive' | 'OutgoingActive'; 
  daysLeft?: string;
  createdAt: string;
  updatedAt: string;   
  transferDate: any;   
  returnDate: any;     
}

@Component({
  selector: 'app-transfers',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule, PaginationComponent],
  templateUrl: './transfer-page.html',
  styleUrl: './transfer-page.css'
})
export class TransferPageComponent implements OnInit, OnDestroy {

  // Summary counts Signals
  incomingCount = signal(0);
  pendingCount = signal(0);
  activeCount = signal(0);
  completedCount = signal(0);
  
  isLoading = signal(false);
  errorMessage = signal('');
  showMenu = signal(false); 
  filterType = signal<'all' | 'IncomingActive' | 'OutgoingActive'>('all');
  searchQuery = signal<string>('');
  activeTab = signal<'incoming' | 'pending' | 'active' | 'completed'>('incoming');

  expandedItemId = signal<string | null>(null);
  
  private allTransfers = signal<TransferDataLocal[]>([]);
  private refreshInterval: any;

  // Pagination Logic
  pageSize = 10;
  currentPage = signal(1);

  constructor(
    private employeeTransferService: EmployeeTransferService,
    private authService: AuthService,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.loadTransfers();
    this.loadAllCounts();
    
    // Refresh data every 5 minutes
    this.refreshInterval = setInterval(() => {
      this.loadTransfers();
      this.loadAllCounts();
    }, 300000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }

  toggleDetails(id: string) {
    if (this.expandedItemId() === id) {
      this.expandedItemId.set(null); 
    } else {
      this.expandedItemId.set(id);
    }
  }

  returnAsset(id: string) {
    if (confirm('Are you sure you want to return this asset? This will change asset status to "In Use" and complete the transfer.')) {
      this.employeeTransferService.returnActiveTransfer(Number(id)).subscribe({
        next: () => {
          this.loadTransfers();
          this.loadAllCounts();
          this.expandedItemId.set(null);
        },
        error: (err) => console.error('Error returning asset:', err)
      });
    }
  }

  setTab(tab: 'incoming' | 'pending' | 'active' | 'completed') {
    this.activeTab.set(tab);
    this.filterType.set('all');
    this.expandedItemId.set(null);
    this.allTransfers.set([]);
    this.currentPage.set(1);
    this.loadTransfers();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedInside = this.elementRef.nativeElement.querySelector('.filter-dropdown')?.contains(event.target);
    if (!clickedInside && this.showMenu()) {
      this.showMenu.set(false);
    }
  }

  loadTransfers() {
    this.isLoading.set(true);
    const currentUserId = this.authService.getUserId();
    if (!currentUserId) {
      this.errorMessage.set('User not authenticated');
      this.isLoading.set(false);
      return;
    }

    this.employeeTransferService.getTransfers(this.activeTab()).subscribe({
      next: (data: TransferData[]) => {
        const mappedData = data.map(item => this.mapToLocal(item, Number(currentUserId)));
        this.allTransfers.set(mappedData);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading transfers', err);
        this.isLoading.set(false);
      }
    });
  }

  private mapToLocal(item: TransferData, loginUserId: number): TransferDataLocal {
   
    let userType: 'IncomingActive' | 'OutgoingActive' | undefined;
    
        if (this.activeTab() === 'active' || this.activeTab() === 'completed') {
      
      if (Number(item.targetUserId) === Number(loginUserId)) {
        userType = 'IncomingActive';
      } else if (Number(item.currentHolderId) === Number(loginUserId)) {
        userType = 'OutgoingActive';
      }
    }

    const hasEndDate = item.transferPeriod && item.transferPeriod.includes(' to ');
    const endDateString = hasEndDate ? item.transferPeriod!.split(' to ')[1] : '';
    const daysLeftText = endDateString ? this.calculateDaysRemaining(endDateString) : 'No Date';

    
    return {
      id: item.id,
      assetTag: item.assetTag || 'N/A',
      assetCode: item.assetCode || 'N/A',
      productName: item.productName || '',
      toDivisionName: item.toDivisionName,
      fromDivisionName: item.fromDivisionName,
      transferByName: item.transferByName,
      targetUserId: item.targetUserId,
      targetUserName: item.targetUserName,
      currentHolderId: item.currentHolderId,
      currentHolderName: item.currentHolderName || 'N/A',
      status: item.status,
      reason: item.reason || '',
      transferPeriod: item.transferPeriod || 'N/A',
      timeAgo: this.getTimeAgo(item.createdAt),
      type: userType,
      daysLeft: daysLeftText,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      transferDate: item.transferDate,
      returnDate: item.returnDate
    };
  }
  
  // loads the counts for each transfer category
  loadAllCounts() {
    const userId = Number(this.authService.getUserId());
    this.employeeTransferService.getTransferCounts(userId).subscribe({
      next: (counts) => {
        if (counts) {
          this.incomingCount.set(counts.incomingCount);
          this.pendingCount.set(counts.pendingCount);
          this.activeCount.set(counts.activeCount);
          this.completedCount.set(counts.completedCount);
        }
      },
      error: (err) => console.error('Error loading counts from backend:', err)
    });
  }

  // filtering results based on active tab, filter type, and search query
  filteredResults = computed(() => {
    let results = this.allTransfers();
    
    if ((this.activeTab() === 'active' || this.activeTab() === 'completed') && this.filterType() !== 'all') {
      results = results.filter(t => t.type === this.filterType());
    }
    
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      results = results.filter(t =>
        t.assetTag.toLowerCase().includes(query) ||
        t.assetCode.toLowerCase().includes(query) ||
        t.targetUserName.toLowerCase().includes(query) ||
        t.productName.toLowerCase().includes(query)
      );
    }
    results.sort((a, b) => Number(b.id) - Number(a.id));
    return results;
  });

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.currentPage.set(1);
  }

  setFilterType(type: 'all' | 'IncomingActive' | 'OutgoingActive'): void {
    this.filterType.set(type);
    this.showMenu.set(false);
    this.currentPage.set(1);
  }

  // Action methods for Accept
  acceptTransfer(id: number) {
    this.employeeTransferService.acceptTransfer(id).subscribe({
      next: () => {
        this.loadTransfers(); 
        this.loadAllCounts(); 
      },
      error: (err) => console.error('Error updating status', err)
    });
  }

  // Similar methods for  reject can be implemented here
  rejectTransfer(id: number) {
    this.employeeTransferService.rejectTransfer(id).subscribe({
      next: () => {
        this.loadTransfers();
        this.loadAllCounts(); 
      },
      error: (err) => console.error('Error rejecting transfer', err)
    });
  }

  // Additional methods for confirm, cancel, etc. can be implemented similarly
  private getTimeAgo(dateString: string): string {
    if (!dateString) return 'Just now';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    if (diffMs < 0) return 'Just now'; 

    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffSeconds < 60) return 'Just now';
    if (diffMinutes < 60) return diffMinutes === 1 ? '1 min ago' : `${diffMinutes} mins ago`;
    if (diffHours < 24) return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffWeeks < 4) return diffWeeks === 1 ? '1 week ago' : `${diffWeeks} weeks ago`;
    
    return diffMonths === 1 ? '1 month ago' : `${diffMonths} months ago`;
  }

  // 💡 This function calculates the days remaining until the transfer expires based on the end date. It also handles overdue cases and formats the output accordingly.
  private calculateDaysRemaining(transferDate: string): string {
    if (!transferDate) return 'No Date';

    const date = new Date(transferDate);
    const now = new Date(); 
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return diffDays === -1 ? 'Overdue by 1 day' : `Overdue by ${Math.abs(diffDays)} days`;
    }
    if (diffDays === 0) return 'Expires Today';
    if (diffDays === 1) return 'Tomorrow';
    
    return `${diffDays} days left`;
  }

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredResults().length / this.pageSize)));

  paginatedRequests = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredResults().slice(start, start + this.pageSize);
  });

  pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  onPageChange(page: number) {
    this.currentPage.set(page);
  }
}