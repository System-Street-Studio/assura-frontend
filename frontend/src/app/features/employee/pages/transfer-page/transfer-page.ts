import { Component, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

// දත්ත වල ව්‍යුහය (Interface)
interface TransferDataLocal {
  id: string;
  assetName: string;
  division: string;
  duration: string;
  requestedBy: string;
  assetNeedTo: string;
  reason: string;
  status: 'Incoming' | 'Active' | 'Pending' | 'Approved' | 'Completed';
  timeAgo: string;
  image?: string;
  type?: 'Incoming' | 'Outgoing'; // Active/Completed 
  daysLeft?: string; // Active 
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

  constructor() {
    // No backend services - will be rebuilt later
  }

  ngOnInit(): void {
    // Backend functionality removed - will be rebuilt later
    console.log('Transfer page initialized - backend functionality removed');
  }

  ngOnDestroy(): void {
    // No destroy logic needed
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