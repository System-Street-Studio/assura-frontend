

import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { RequestService } from '../../services/requests.service';

// දත්ත වල ව්‍යුහය (Interface)
interface TransferData {
  id: string; // This is the record ID for operations
  dbId: number;
  assetName: string;
  division: string;
  duration: string;
  requestedBy: string;
  assetNeedTo: string;
  reason: string;
  status: string;
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
  styleUrl: './transfer-page.css'
})
export class TransferPageComponent implements OnInit {
  private requestService = inject(RequestService);

  activeTab = signal<'incoming' | 'pending' | 'active' | 'completed'>('incoming');

  private allData = signal<TransferData[]>([]);

  showMenu = false;
  filterType = signal<'all' | 'Incoming' | 'Outgoing'>('all');
  searchQuery = signal<string>('');

  ngOnInit(): void {
    this.loadTransfers();
  }

  loadTransfers() {
    this.requestService.getAllRequests(true).subscribe({
      next: (requests: any[]) => {
        const transfers = requests
          .filter(r => r.type === 'Transfer')
          .map(r => {
            const status = this.mapWorkflowStatus(r.status);
            return {
              id: r.requestNumber || r.id.toString(),
              dbId: r.id,
              assetName: r.assetName || 'Unknown Asset',
              division: r.assetDivisionName || 'General',
              duration: 'As requested',
              requestedBy: r.requesterName,
              assetNeedTo: r.requesterName,
              reason: r.description || 'Asset Transfer Request',
              status: status,
              timeAgo: 'Recently',
              image: this.getDefaultImage(r.category),
              // Logic: If requester's department is the current head's department, it's Outgoing from their perspective? 
              // Actually, Incoming = we receive, Outgoing = we send.
              // If AssetDivisionName is ours, we are SENDING (Outgoing).
              type: r.assetDivisionName === r.department ? 'Incoming' : 'Outgoing',
              acceptedBy: 'Pending',
              assetOwner: r.requesterName
            } as TransferData;
          });
        this.allData.set(transfers);
      }
    });
  }

  private mapWorkflowStatus(status: string): string {
    if (status === 'PendingDivisionHeadApproval') return 'Incoming';
    if (status === 'PendingStorekeeperReview') return 'Pending';
    if (status === 'Approved') return 'Confirmed';
    if (status === 'Rejected') return 'Rejected';
    if (status === 'TemporaryAssigned') return 'Active';
    if (status === 'Completed') return 'Completed';
    return status;
  }

  private getDefaultImage(category: string): string {
    if (category?.toLowerCase().includes('laptop')) return 'https://tse2.mm.bing.net/th/id/OIP.7L_Ho2CVPF-m88H7_UoM3AHaFS?pid=Api&P=0&h=220';
    return 'https://tse2.mm.bing.net/th/id/OIP.U_KKE5Cp6OVgC8akAAmqPAHaHa?pid=Api&P=0&h=220';
  }

  filteredResults = computed(() => {
    const tab = this.activeTab();
    const typeFilter = this.filterType();
    const query = this.searchQuery().toLowerCase().trim();
    let data = this.allData();

    if (tab === 'incoming') data = data.filter(i => i.status === 'Incoming');
    else if (tab === 'pending') data = data.filter(i => i.status === 'Pending' || i.status === 'Confirmed' || i.status === 'Rejected');
    else if (tab === 'active') data = data.filter(i => i.status === 'Active');
    else if (tab === 'completed') data = data.filter(i => i.status === 'Completed');

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

  setFilterType(type: 'all' | 'Incoming' | 'Outgoing') {
    this.filterType.set(type);
  }

  incomingCount = computed(() => this.allData().filter(i => i.status === 'Incoming').length);
  pendingCount = computed(() => this.allData().filter(i => i.status === 'Pending' || i.status === 'Confirmed').length);
  activeCount = computed(() => this.allData().filter(i => i.status === 'Active').length);
  completedCount = computed(() => this.allData().filter(i => i.status === 'Completed').length);

  setTab(tab: 'incoming' | 'pending' | 'active' | 'completed') {
    this.activeTab.set(tab);
  }

  onAccept(id: number) {
    this.requestService.approveRequest(id).subscribe({
      next: () => {
        console.log('✅ Approved transfer:', id);
        this.loadTransfers();
      }
    });
  }

  onReject(id: number) {
    this.requestService.rejectRequest(id, 'Rejected by division head').subscribe({
      next: () => {
        console.log('❌ Rejected transfer:', id);
        this.loadTransfers();
      }
    });
  }
}
