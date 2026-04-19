import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  activeFilter: string = '';

  queue: QueueItem[] = [
    // Pending
    { id: '1', name: 'Dell XPS 15 Laptop', division: 'Information Technology', timeAgo: '1 day ago', date: '2026-02-23', status: 'Pending', time: '10:04', assetType: 'Computer', specialNote: 'Performance of this laptop is not enough' },
    { id: '2', name: 'Intel NUC', division: 'HR', timeAgo: '2 days ago', date: '2026-02-22', status: 'Pending', time: '14:20', assetType: 'Mini PC', specialNote: 'Faulty power supply' },
    { id: '3', name: 'MacBook Pro', division: 'Admin', timeAgo: '3 days ago', date: '2026-02-21', status: 'Pending', time: '09:00', assetType: 'Laptop', specialNote: 'Old hardware, replacement needed' },
    // Discarded
    { id: '4', name: 'Sony WH-1000XM5', division: 'Sales', timeAgo: '3 days ago', date: '2026-02-21', status: 'Discarded', time: '11:30', assetType: 'Peripheral', specialNote: 'Battery not charging — beyond repair' },
    { id: '5', name: 'Logitech MX Master 3S', division: 'IT Support', timeAgo: '4 days ago', date: '2026-02-20', status: 'Discarded', time: '15:45', assetType: 'Peripheral', specialNote: 'Click mechanism failure, warranty expired' },
    // Unread
    { id: '6', name: 'HP EliteBook 840', division: 'Finance', timeAgo: '5 hours ago', date: '2026-02-24', status: 'Unread', time: '07:30', assetType: 'Laptop', specialNote: 'New request — screen flickering issue' },
    { id: '7', name: 'Samsung Galaxy Tab S9', division: 'Marketing', timeAgo: '2 hours ago', date: '2026-02-24', status: 'Unread', time: '10:15', assetType: 'Tablet', specialNote: 'Touchscreen unresponsive on edges' },
    { id: '8', name: 'Canon EOS R5', division: 'Media', timeAgo: '30 min ago', date: '2026-02-24', status: 'Unread', time: '12:30', assetType: 'Camera', specialNote: 'Lens mount alignment issue reported' },
    // Rejected
    { id: '9', name: 'Mechanical Keyboard', division: 'Design', timeAgo: '1 day ago', date: '2026-02-23', status: 'Rejected', time: '16:00', assetType: 'Peripheral', specialNote: 'Rejected — item still under warranty, return to vendor' },
    { id: '10', name: 'USB-C Hub', division: 'Engineering', timeAgo: '2 days ago', date: '2026-02-22', status: 'Rejected', time: '13:10', assetType: 'Accessory', specialNote: 'Rejected — cost below threshold for discard' },
    // Approved
    { id: '11', name: 'ThinkPad Docking Station', division: 'IT', timeAgo: '1 day ago', date: '2026-02-23', status: 'Approved', time: '09:45', assetType: 'Accessory', specialNote: 'Approved for discard — no longer compatible' },
    { id: '12', name: 'Cisco IP Phone', division: 'Operations', timeAgo: '2 days ago', date: '2026-02-22', status: 'Approved', time: '08:20', assetType: 'Phone', specialNote: 'Approved — replaced by VoIP software' },
    { id: '13', name: 'Dell P2419H Monitor', division: 'Legal', timeAgo: '3 days ago', date: '2026-02-21', status: 'Approved', time: '14:55', assetType: 'Monitor', specialNote: 'Approved for recycling — dead pixels' },
    { id: '14', name: 'APC UPS 1500VA', division: 'Server Room', timeAgo: '5 days ago', date: '2026-02-19', status: 'Approved', time: '11:00', assetType: 'Power', specialNote: 'Approved — battery replacement not cost-effective' }
  ];

  filteredQueue: QueueItem[] = [];
  selectedItem: QueueItem | null = null;

  get pendingCount() { return this.queue.filter(i => i.status === 'Pending').length; }
  get discardedCount() { return this.queue.filter(i => i.status === 'Discarded').length; }
  get unreadCount() { return this.queue.filter(i => i.status === 'Unread').length; }
  get rejectedCount() { return this.queue.filter(i => i.status === 'Rejected').length; }
  get approvedCount() { return this.queue.filter(i => i.status === 'Approved').length; }

  // Review flow state
  reviewStep: 'idle' | 'choose' | 'notes' = 'idle';
  reviewAction: 'done' | 'reject' | '' = '';
  reviewNote: string = '';

  // Feedback cards
  showSuccessCard = false;
  showRejectCard = false;

  ngOnInit() {
    this.filteredQueue = [...this.queue];
    this.selectedItem = this.filteredQueue[0] || null;
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

    if (action === 'done') {
      this.selectedItem.status = 'Approved';
    } else {
      this.selectedItem.status = 'Rejected';
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
