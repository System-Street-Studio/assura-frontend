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

  // Summary counts
  outgoingCount = signal(0);
  incomingCount = signal(0);
  pendingCount = signal(0);
  activeCount = signal(0);
  completedCount = signal(0);

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
    this.loadAllCounts();
    
    //refresh data every 5 minutes
    this.refreshInterval = setInterval(() => {
    this.loadTransfers();
    this.loadAllCounts();
    }, 300000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }

  loadAllCounts() {
    const userId = Number(this.authService.getUserId());
    
    this.transferService.getTransferCounts(userId).subscribe({
      next: (counts) => {
        if (counts) {
          this.outgoingCount.set(counts.outgoingCount);
          this.incomingCount.set(counts.incomingCount);
          this.pendingCount.set(counts.pendingCount);
          this.activeCount.set(counts.activeCount);
          this.completedCount.set(counts.completedCount);
        }
      },
      error: (err) => console.error('Error loading counts from backend:', err)
    });
  }

  // Function to load transfers based on active tab
 loadTransfers() {
  this.isLoading.set(true);
  const userDivisionId = Number(this.authService.getDivisionId());

  this.transferService.getDivisionHeadTransfers(this.activeTab()).subscribe({
     next: (data) => {
      
      const mapped = data.map(item => {
       
       
        let assignedType: 'Incoming Active' | 'Outgoing Active';

        const toId = Number(item.toDivisionId);
        const fromId = Number(item.fromDivisionId);

        
        if (toId === userDivisionId) {
            assignedType = 'Incoming Active';
        } 
      
        else if (fromId === userDivisionId) {
            assignedType = 'Outgoing Active';
        } 
       
        else {
            console.warn(`Division ID mismatch: My Div(${userDivisionId}) | From(${fromId}) | To(${toId})`);
            assignedType = 'Outgoing Active'; 
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

  // Function to return an active transfer (used in active transfers tab)
returnAsset(id: string) {
    if (confirm('Are you sure you want to return this asset? This will change asset status to "In Use" and complete the transfer.')) {
      this.transferService.returnActiveTransfer(Number(id)).subscribe({
        next: () => {
         
          this.loadTransfers();
          this.loadAllCounts();
          this.expandedItemId.set(null);
        },
        error: (err) => console.error('Error returning asset:', err)
      });
    }
  }

  // Mapping function to convert API data to local format
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

  // Action functions for approve, reject, confirm
  approveTransfer(id: string) {
    this.transferService.approveByHead(Number(id)).subscribe(() => {
      this.loadTransfers();
      this.loadAllCounts(); 
    });
  }

  confirmTransfer(id: string) {
    this.transferService.confirmByHead(Number(id)).subscribe(() => {
      this.loadTransfers();
      this.loadAllCounts(); 
    });
  }

  cancelTransfer(id: string) {
    this.transferService.cancelByHead(Number(id)).subscribe(() => {
      this.loadTransfers();
      this.loadAllCounts(); 
    }); 
  }

  rejectTransfer(id: string) {
    const reason = prompt('Please enter a reason for rejection:');
    if (reason === null) return;
    this.transferService.rejectByHead(Number(id), reason || 'No reason provided').subscribe(() => {
      this.loadTransfers();
      this.loadAllCounts(); 
    });
  }

  

  // Filter and search functions
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
     results.sort((a, b) => Number(b.id) - Number(a.id));
    return results;
  });

      

 
  //calculate days receiving transfer request
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

    //calculate remaining days for overdue transfer period
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
  

      pageSize = 20;
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
