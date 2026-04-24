import { Component, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

// දත්ත වල ව්‍යුහය (Interface)
interface TransferData {
  id: string;
  assetName: string;
  division: string;
  duration: string;
  requestedBy: string;
  assetNeedTo: string;
  assetNeedToId?: string;
  reason: string;
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

  // Component එක ඇතුළේ පාවිච්චි කරන Signals
  isLoading = signal(false);
  errorMessage = signal('');
  activeTab = signal<'incoming' | 'pending' | 'active' | 'completed' | 'outgoing'>('incoming');
  filterType = signal<'all' | 'Incoming' | 'Outgoing'>('all');
  searchQuery = signal<string>('');
  showMenu = false;

  // Real data ගබඩා කරන signal එක (මුලින් හිස් array එකක්)
  private allData = signal<TransferData[]>([]);

  constructor() {
    // No backend services - will be rebuilt later
  }

  ngOnInit(): void {
    // Backend functionality removed - will be rebuilt later
    console.log('Approvals transfer page initialized - backend functionality removed');
  }

  // Filtered logic එක (Computed signal එකක් නිසා performance වැඩියි)
  filteredResults = computed(() => {
    const tab = this.activeTab();
    const typeFilter = this.filterType();
    const query = this.searchQuery().toLowerCase().trim();
    const data = this.allData();

    let filtered = [...data];

    // 1. Tab එක අනුව filter කිරීම
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

    // 2. Incoming/Outgoing filter එක (Active/Completed සඳහා)
    if ((tab === 'active' || tab === 'completed') && typeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === typeFilter);
    }

    // 3. Search query එක අනුව filter කිරීම
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
    // මෙතනට API call එක දාන්න
  }

  onReject(id: string) {
    console.log('Rejected:', id);
  }

 

  ngOnDestroy(): void {
    // No cleanup needed - backend functionality removed
  }
}