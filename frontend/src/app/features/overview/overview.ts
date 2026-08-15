import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { QueueItemsService, QueueItem } from '../../services/queue-items.service';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './overview.html',
  styleUrls: ['./overview.css']
})
export class OverviewComponent implements OnInit {
  isPendingUser = false;
  activeFilter: string = '';
  queue: QueueItem[] = [];
  filteredQueue: QueueItem[] = [];
  selectedItem: QueueItem | null = null;
  isLoading = true;

  get pendingCount() { return this.queue.filter(i => i.status === 'Pending').length; }
  get discardedCount() { return this.queue.filter(i => i.status === 'Discarded').length; }
  get unreadCount() { return this.queue.filter(i => i.status === 'Unread').length; }
  get rejectedCount() { return this.queue.filter(i => i.status === 'Rejected').length; }
  get approvedCount() { return this.queue.filter(i => i.status === 'Approved').length; }
  get totalCount() { return this.queue.length; }
  get todayCount() {
    return this.queue.filter(i => this.isToday(i.date)).length;
  }

  isToday(dateStr?: string): boolean {
    if (!dateStr) return false;
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayLocal = `${year}-${month}-${day}`;

    if (dateStr.startsWith(todayLocal)) return true;

    try {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        const pYear = parsed.getFullYear();
        const pMonth = String(parsed.getMonth() + 1).padStart(2, '0');
        const pDay = String(parsed.getDate()).padStart(2, '0');
        return `${pYear}-${pMonth}-${pDay}` === todayLocal;
      }
    } catch {
      // ignore
    }
    return false;
  }

  // Review flow state
  reviewStep: 'idle' | 'choose' | 'notes' = 'idle';
  reviewAction: 'done' | 'reject' | '' = '';
  reviewNoteControl = new FormControl('', [Validators.required, Validators.minLength(5)]);

  // Feedback cards
  showSuccessCard = false;
  showRejectCard = false;

  greeting = 'Welcome';
  firstName = 'Superintendent';
  currentDate = new Date();

  constructor(
    private queueItemsService: QueueItemsService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.isPendingUser = this.authService.hasRole('Pending');
    
    if (this.isPendingUser) {
      this.isLoading = false;
      return;
    }

    const hour = new Date().getHours();
    this.greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    this.queueItemsService.getAll().subscribe({
      next: (data) => {
        this.queue = data;
        this.filteredQueue = [...this.queue];

        this.route.queryParams.subscribe(params => {
          const selectId = params['selectId'];
          if (selectId) {
            const found = this.queue.find(item => item.id === selectId);
            if (found) {
              this.activeFilter = found.status;
              this.filteredQueue = this.queue.filter(i => i.status === found.status);
              this.selectedItem = found;
            }
          } else if (this.filteredQueue.length > 0) {
            this.selectedItem = this.filteredQueue[0];
          }
          this.cdr.markForCheck();
        });

        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load queue items:', err);
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  filterByStatus(status: string) {
    if (this.activeFilter === status) {
      this.activeFilter = '';
      this.filteredQueue = [...this.queue];
    } else {
      this.activeFilter = status;
      if (status === 'Today') {
        this.filteredQueue = this.queue.filter(i => this.isToday(i.date));
      } else if (status === '') {
        this.filteredQueue = [...this.queue];
      } else {
        this.filteredQueue = this.queue.filter(i => i.status === status);
      }
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

  startReview() {
    this.reviewStep = 'choose';
  }

  chooseAction(action: 'done' | 'reject') {
    this.reviewAction = action;
    this.reviewStep = 'notes';
    this.reviewNoteControl.reset('');
  }

  submitReview() {
    if (!this.selectedItem) return;

    if (this.reviewNoteControl.invalid) {
      this.reviewNoteControl.markAsTouched();
      return;
    }

    const action = this.reviewAction;
    const newStatus = action === 'done' ? 'Approved' : 'Rejected';

    this.queueItemsService.updateStatus(this.selectedItem.id, newStatus, this.reviewNoteControl.value ?? '').subscribe({
      next: () => {
        if (this.selectedItem) {
          this.selectedItem.status = newStatus;
        }

        if (this.activeFilter === 'Today') {
          this.filteredQueue = this.queue.filter(i => this.isToday(i.date));
        } else if (this.activeFilter) {
          this.filteredQueue = this.queue.filter(i => i.status === this.activeFilter);
        } else {
          this.filteredQueue = [...this.queue];
        }

        this.resetReview();
        this.selectedItem = this.filteredQueue[0] || null;

        if (action === 'done') {
          this.showSuccessCard = true;
          setTimeout(() => { this.showSuccessCard = false; this.cdr.markForCheck(); }, 3000);
        } else {
          this.showRejectCard = true;
          setTimeout(() => { this.showRejectCard = false; this.cdr.markForCheck(); }, 3000);
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to update status:', err);
        this.cdr.markForCheck();
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
    this.reviewNoteControl.reset('');
  }
}
