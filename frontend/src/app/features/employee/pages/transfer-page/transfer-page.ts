import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { TransferService } from '../../services/asset-transfer.service';

interface TransferData {
    id: number;
    transferNumber?: string;
    transferDate: string;
    createdAt: string;
    assetId?: number;
    assetTag?: string;
    assetCode?: string;
    productName?: string;
    fromDivisionName?: string;
    toDivisionName?: string;
    transferByName?: string;
    targetUserId?: number;
    targetUserName?: string;
    currentHolderId?: number;
    status?: string;
    transferPeriod?: string;
}

interface TransferDataLocal {
    id: number | string;
    assetTag: string;
    assetCode: string;
    productName: string;
    toDivisionName?: string;
    transferByName?: string;
    targetUserId?: number;
    targetUserName?: string;
    currentHolderId?: number;
    reason?: string;
    status?: string;
    transferPeriod?: string;
    timeAgo?: string;
    type?: 'IncomingActive' | 'OutgoingActive' | 'Incoming' | 'Outgoing' | string;
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
    isLoading = signal(false);
    errorMessage = signal('');
    showMenu = signal(false);

    activeTab = signal<'incoming' | 'pending' | 'active' | 'completed'>('incoming');

    private allTransfers = signal<TransferDataLocal[]>([]);

    filterType = signal<'all' | 'IncomingActive' | 'OutgoingActive'>('all');
    searchQuery = signal<string>('');

    private transferService = inject(TransferService);
    private authService = inject(AuthService);

    ngOnInit(): void {
        this.loadTransfers();
    }

    setTab(tab: 'incoming' | 'pending' | 'active' | 'completed') {
        this.activeTab.set(tab);
        this.filterType.set('all');
        this.loadTransfers();
    }

    loadTransfers() {
        this.isLoading.set(true);
        const currentUserId = this.authService.getUserId?.() || null;
        const employeeId = currentUserId ? Number(currentUserId) : null;
        
        this.transferService.getTransfers(this.activeTab(), this.filterType(), employeeId).subscribe({
            next: (data: TransferData[]) => {
                const mapped = data.map(d => this.mapToLocal(d, employeeId));
                this.allTransfers.set(mapped);
                this.isLoading.set(false);
            },
            error: () => {
                this.isLoading.set(false);
            }
        });
    }

    private mapToLocal(item: TransferData, loginUserId: number | null): TransferDataLocal {
        let userType: TransferDataLocal['type'] = undefined;
        if ((this.activeTab() === 'active' || this.activeTab() === 'completed') && loginUserId != null) {
            if (item.targetUserId === loginUserId) userType = 'IncomingActive';
            else if (item.currentHolderId === loginUserId) userType = 'OutgoingActive';
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
            reason: '',
            status: item.status || 'IncomingActive',
            transferPeriod: item.transferPeriod,
            timeAgo: this.calculateTimeAgo(item.createdAt),
            type: userType,
            daysLeft: this.calculateDaysLeft(item.transferDate)
        };
    }

    filteredResults = computed(() => {
        let results = this.allTransfers();
        if (this.activeTab() === 'active' && this.filterType() !== 'all') {
            results = results.filter(t => t.type === this.filterType());
        }
        const query = this.searchQuery().toLowerCase().trim();
        if (query) {
            results = results.filter(t =>
                (t.assetTag || '').toLowerCase().includes(query) ||
                (t.assetCode || '').toLowerCase().includes(query) ||
                (t.targetUserName || '').toLowerCase().includes(query)
            );
        }
        return results;
    });

    incomingCount = computed(() => this.allTransfers().filter(i => i.status === 'IncomingActive').length);
    pendingCount = computed(() => this.allTransfers().filter(i => i.status === 'Pending').length);
    activeCount = computed(() => this.allTransfers().filter(i => i.status === 'Active').length);
    completedCount = computed(() => this.allTransfers().filter(i => i.status === 'Completed').length);

    onSearchChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.searchQuery.set(input.value || '');
    }

    setFilterType(type: 'all' | 'IncomingActive' | 'OutgoingActive'): void {
        this.filterType.set(type);
        this.showMenu.set(false);
    }

    private calculateTimeAgo(dateStr?: string): string {
        if (!dateStr) return 'Just now';
        const date = new Date(dateStr);
        const diff = Date.now() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        return `${days} days ago`;
    }

    private calculateDaysLeft(dateStr?: string): string {
        if (!dateStr) return '';
        const then = new Date(dateStr).getTime();
        const diff = then - Date.now();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days > 0 ? `${days} days left` : 'Overdue';
    }

    acceptTransfer(id: number | string) {
        this.transferService.acceptTransfer(Number(id)).subscribe({
            next: () => this.loadTransfers(),
            error: (err) => console.error('Error updating status', err)
        });
    }

    rejectTransfer(id: number | string) {
        this.transferService.rejectTransfer(Number(id)).subscribe({
            next: () => this.loadTransfers(),
            error: (err) => console.error('Error rejecting transfer', err)
        });
    }
}
