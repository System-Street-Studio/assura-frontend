import { Component, signal, computed, OnInit, OnDestroy ,HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { HeadTransferService } from '../../services/transfer.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';

// Data structure interface
interface TransferData {
  id: string;
  assetTag: string;
  assetCode: string;
  productName: string;
  targetUserName: string;
  targetUserId?: number;
  currentHolderName: string;
  currentHolderId?: number;
  fromDivisionName: string;
  toDivisionName: string;
  fromDivisionId: number;
  toDivisionId: number;
  transferByName: string;
  transferById?: number;
  reason: string;
  transferPeriod?: string;
  transferDate: any;
  returnDate: any;
  status: string;
  timeAgo: string;
  createdDate?: string;
  type?: 'Incoming Active' | 'Outgoing Active';
  daysLeft?: string;
}

@Component({
  selector: 'app-transfers',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule,PaginationComponent],
  templateUrl: './transfer-page.html',
  styleUrls: ['./transfer-page.css']
})
export class TransferPageComponent implements OnInit, OnDestroy {
  // Component signals
  isLoading = signal(false);
  activeTab = signal<'outgoing' | 'incoming' | 'pending' | 'active' | 'completed'>('outgoing');
  filterType = signal<'all' | 'Incoming Active' | 'Outgoing Active'>('all');
  searchQuery = signal<string>('');
  showMenu = signal(false);

  expandedItemId = signal<string | null>(null);

  private allData = signal<TransferData[]>([]);
  private refreshInterval: any;

  constructor(
    private transferService: HeadTransferService,
    private authService: AuthService,
    private elementRef: ElementRef
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
  const userDivisionId = Number(this.authService.getDivisionId());

  this.transferService.getDivisionHeadTransfers(this.activeTab()).subscribe({
    next: (data) => {
      
      const mapped = data.map(item => {
       
        let assignedType: 'Incoming Active' | 'Outgoing Active' = 'Outgoing Active';
        
        if (Number(item.toDivisionId) === userDivisionId) {
          assignedType = 'Incoming Active';
        } else if (Number(item.fromDivisionId) === userDivisionId) {
          assignedType = 'Outgoing Active';
        } else {
         
          assignedType = item.toDivisionName?.toLowerCase().includes('it') || item.targetUserName?.toLowerCase().includes('it')
            ? 'Incoming Active' 
            : 'Outgoing Active';
        }

        const hasEndDate = item.transferPeriod && item.transferPeriod.includes(' to ');
        const endDateString = hasEndDate ? item.transferPeriod!.split(' to ')[1] : '';
        const daysLeftText = endDateString ? this.calculateDaysRemaining(endDateString) : 'No Date';

        return {
          ...item,
          id: item.id.toString(),
          timeAgo: this.getTimeAgo(item.createdAt || item.requestDate), 
          type: assignedType,
          daysLeft: daysLeftText
        };
      });
      this.allData.set(mapped);
      this.isLoading.set(false);
    },
    error: () => this.isLoading.set(false)
  });
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
      this.transferService.returnActiveTransfer(Number(id)).subscribe({
        next: () => {
         
          this.loadTransfers();
          this.expandedItemId.set(null);
        },
        error: (err) => console.error('Error returning asset:', err)
      });
    }
  }

  setTab(tab: 'outgoing' | 'incoming' | 'pending' | 'active' | 'completed') {
    this.activeTab.set(tab);
    this.filterType.set('all');
    this.expandedItemId.set(null);
    this.allData.set([]); 
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

  approveTransfer(id: string) {
    this.transferService.approveByHead(Number(id)).subscribe(() => this.loadTransfers());
  }

  confirmTransfer(id: string) {
    this.transferService.confirmByHead(Number(id)).subscribe(() => this.loadTransfers());
  }

  rejectTransfer(id: string, reason?: string) {
    this.transferService.rejectByHead(Number(id), reason || 'No reason provided').subscribe(() => this.loadTransfers());
  }

  setFilterType(type: 'all' | 'Incoming Active' | 'Outgoing Active') {
    this.filterType.set(type);
    this.showMenu.set(false);
    this.currentPage.set(1);
  }

  onSearchChange(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
    this.currentPage.set(1);
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
        t.transferByName.toLowerCase().includes(query)
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

      if (diffSeconds < 60) {
        return 'Just now';
      }
      if (diffMinutes < 60) {
        return diffMinutes === 1 ? '1 min ago' : `${diffMinutes} mins ago`;
      }
      if (diffHours < 24) {
        return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
      }
      if (diffDays === 1) {
        return 'Yesterday';
      }
      if (diffDays < 7) {
        return `${diffDays} days ago`;
      }
      
      if (diffWeeks < 4) {
        return diffWeeks === 1 ? '1 week ago' : `${diffWeeks} weeks ago`;
      }
      
      return diffMonths === 1 ? '1 month ago' : `${diffMonths} months ago`;
    }


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
  
   
      pageSize = 10;
      currentPage = signal(1);

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
