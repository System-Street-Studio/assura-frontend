import { Component, signal, computed, OnInit, inject ,OnDestroy ,HostListener, ElementRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { EmployeeTransferService } from '../../services/asset-transfer.service';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';




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
  transferPeriod: string;
  timeAgo: string;
  image?: string;
  type?: 'IncomingActive' | 'OutgoingActive'; 
  daysLeft?: string;
}

@Component({
  selector: 'app-transfers',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule,PaginationComponent],
  templateUrl: './transfer-page.html',
  styleUrl: './transfer-page.css'
})
export class TransferPageComponent implements OnInit {
  // Loading state
  isLoading = signal(false);
  errorMessage = signal('');
  showMenu = signal(false);
  // Filter and search signals
  filterType = signal<'all' | 'IncomingActive' | 'OutgoingActive'>('all');
  searchQuery = signal<string>('');
  // (Default: incoming)
  activeTab = signal<'incoming' | 'pending' | 'active' | 'completed'>('incoming');

  // Transfer data
  private allTransfers = signal<TransferDataLocal[]>([]);
  expandedItemId = signal<string | null>(null);
  private refreshInterval: any;
  private transferService = inject(EmployeeTransferService);
  private authService = inject(AuthService);
  private elementRef = inject(ElementRef);

 

  ngOnInit(): void {
    this.loadTransfers();
    //this.loadAllCounts();
    
    //refresh data every 5 minutes
    this.refreshInterval = setInterval(() => {
    this.loadTransfers();
    //this.loadAllCounts();
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

  // Function to return an active transfer (used in active transfers tab)
returnAsset(id: string) {
    if (confirm('Are you sure you want to return this asset? This will change asset status to "In Use" and complete the transfer.')) {
      this.transferService.returnActiveTransfer(Number(id)).subscribe({
        next: () => {
         
          this.loadTransfers();
         // this.loadAllCounts();
          this.expandedItemId.set(null);
        },
        error: (err) => console.error('Error returning asset:', err)
      });
    }
  }

  // Tab change function
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

    // Backend API Call 
    this.transferService.getTransfers(this.activeTab()).subscribe({
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
  // 
  private mapToLocal(item: TransferData, loginUserId: number): TransferDataLocal {
   
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
    this.currentPage.set(1);
  }

  setFilterType(type: 'all' | 'IncomingActive' | 'OutgoingActive'): void {
    this.filterType.set(type);
    this.showMenu.set(false);
    this.currentPage.set(1);
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
