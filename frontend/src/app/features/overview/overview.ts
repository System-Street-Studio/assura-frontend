import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

export interface QueueItem {
  id: string;
  name: string;
  division: string;
  timeAgo: string;
  date: string;
  status: string;
  time: string;
  assetType: string;
  specialNote: string;
}

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './overview.html',
  styleUrls: ['./overview.css']
})
export class OverviewComponent implements OnInit {
  activeFilter = '';

  api = inject(ApiService);
  queue: QueueItem[] = [];

  filteredQueue: QueueItem[] = [];
  selectedItem: QueueItem | null = null;

  get pendingCount() { return this.queue.filter(i => i.status === 'Pending').length; }
  get discardedCount() { return this.queue.filter(i => i.status === 'Discarded').length; }
  get unreadCount() { return this.queue.filter(i => i.status === 'Unread').length; }
  get rejectedCount() { return this.queue.filter(i => i.status === 'Rejected').length; }
  get approvedCount() { return this.queue.filter(i => i.status === 'Approved' || i.status === 'Completed').length; }

  // Review flow state
  reviewStep: 'idle' | 'choose' | 'notes' = 'idle';
  reviewAction: 'done' | 'reject' | '' = '';
  reviewNote = '';

  // Feedback cards
  showSuccessCard = false;
  showRejectCard = false;

  ngOnInit() {
    this.api.get<QueueItem[]>('DiscardedNotes').subscribe({
      next: (items) => {
        this.queue = items;
        this.filteredQueue = [...this.queue];
        if (this.activeFilter) {
          this.filteredQueue = this.queue.filter(i => i.status === this.activeFilter);
        }
        this.selectedItem = this.filteredQueue[0] || null;
      },
      error: (err) => console.error(err)
    });
  }

  filterByStatus(status: string) {
    if (this.activeFilter === status) {
      this.activeFilter = '';
      this.filteredQueue = [...this.queue];
    } else {
      this.activeFilter = status;
      this.filteredQueue = this.queue.filter(i => i.status === status);
    }
    this.selectedItem = this.filteredQueue[0] || null;
    this.resetReview();
  }

  selectItem(item: QueueItem) {
    this.selectedItem = item;
    this.resetReview();
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  // Step 1: Click Review → show Mark as Done / Reject
  startReview() {
    this.reviewStep = 'choose';
  }

  // Step 2: Click Mark as Done or Reject → show notes input
  chooseAction(action: 'done' | 'reject') {
    this.reviewAction = action;
    this.reviewStep = 'notes';
    this.reviewNote = '';
  }

  // Step 3: Submit the note
  submitReview() {
    if (!this.selectedItem) return;

    const action = this.reviewAction;

    const backendStatus = action === 'done' ? 'Completed' : 'Rejected';
    const frontendStatusLabel = action === 'done' ? 'Approved' : 'Rejected';

    this.api.put(`DiscardedNotes/${this.selectedItem.id}/status`, { status: backendStatus, note: this.reviewNote }).subscribe({
      next: () => {
        if (this.selectedItem) {
          this.selectedItem.status = frontendStatusLabel;
        }

        // Re-filter if a filter is active
        if (this.activeFilter) {
          this.filteredQueue = this.queue.filter(i => i.status === this.activeFilter);
        } else {
          this.filteredQueue = [...this.queue];
        }

        this.resetReview();
        this.selectedItem = this.filteredQueue[0] || null;

        // Show feedback card
        if (action === 'done') {
          this.showSuccessCard = true;
          setTimeout(() => { this.showSuccessCard = false; }, 3000);
        } else {
          this.showRejectCard = true;
          setTimeout(() => { this.showRejectCard = false; }, 3000);
        }
      },
      error: (err) => {
        console.error(err);
        this.resetReview();
      }
    });
  }

  closeSuccessCard() {
    this.showSuccessCard = false;
  }

  closeRejectCard() {
    this.showRejectCard = false;
  }

  cancelReview() {
    this.resetReview();
  }

  private resetReview() {
    this.reviewStep = 'idle';
    this.reviewAction = '';
    this.reviewNote = '';
  }
}
