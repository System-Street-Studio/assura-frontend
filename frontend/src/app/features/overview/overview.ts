import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { QueueItemsService, QueueItem } from '../../services/queue-items.service';
import { BuyersService, Buyer } from '../../services/buyers.service';
import { ToastService } from '../../shared/services/toast.service';
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
  get rejectedCount() { return this.queue.filter(i => i.status === 'Rejected').length; }
  get approvedCount() { return this.queue.filter(i => i.status === 'Approved').length; }
  get totalCount() { return this.queue.length; }

  // Review flow state
  isSubmitting = false;
  reviewStep: 'idle' | 'choose' | 'notes' = 'idle';
  reviewAction: 'done' | 'reject' | '' = '';
  reviewNoteControl = new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(1000)]);
  buyerIdControl = new FormControl<any>(null);
  soldPriceControl = new FormControl<any>(null, [Validators.required, Validators.min(0)]);
  buyers: Buyer[] = [];

  greeting = 'Welcome';
  firstName = 'Superintendent';
  currentDate = new Date();

  constructor(
    private queueItemsService: QueueItemsService,
    private buyersService: BuyersService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.isPendingUser = this.authService.hasRole('Pending');
    
    if (this.isPendingUser) {
      this.isLoading = false;
      return;
    }

    const hour = new Date().getHours();
    this.greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    this.buyersService.getAll().subscribe({
      next: (data) => {
        this.buyers = data;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Failed to load buyers:', err)
    });

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
      if (status === '') {
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
    this.buyerIdControl.reset(null);
    this.soldPriceControl.reset(null);
  }

  submitReview() {
    if (!this.selectedItem || this.isSubmitting) return;

    let hasError = false;

    const note = (this.reviewNoteControl.value ?? '').trim();
    if (!note || note.length < 5) {
      this.reviewNoteControl.markAsTouched();
      this.reviewNoteControl.setErrors({ minlength: true });
      hasError = true;
    }

    const action = this.reviewAction;

    if (action === 'done') {
      const rawBuyerId = this.buyerIdControl.value;
      if (rawBuyerId === null || rawBuyerId === undefined || rawBuyerId === '' || isNaN(Number(rawBuyerId))) {
        this.buyerIdControl.markAsTouched();
        this.buyerIdControl.setErrors({ required: true });
        hasError = true;
      }

      const rawPrice = this.soldPriceControl.value;
      if (rawPrice === null || rawPrice === undefined || rawPrice === '' || isNaN(Number(rawPrice)) || Number(rawPrice) < 0) {
        this.soldPriceControl.markAsTouched();
        this.soldPriceControl.setErrors({ required: true });
        hasError = true;
      }
    }

    if (hasError) {
      this.cdr.markForCheck();
      return;
    }

    this.isSubmitting = true;
    const newStatus = action === 'done' ? 'Approved' : 'Rejected';
    const buyerId = action === 'done' ? Number(this.buyerIdControl.value) : null;
    const soldPrice = action === 'done' ? Number(this.soldPriceControl.value) : null;

    this.queueItemsService.updateStatus(this.selectedItem.id, newStatus, note, buyerId, soldPrice).subscribe({
      next: () => {
        this.isSubmitting = false;
        if (this.selectedItem) {
          this.selectedItem.status = newStatus;
        }

        if (this.activeFilter) {
          this.filteredQueue = this.queue.filter(i => i.status === this.activeFilter);
        } else {
          this.filteredQueue = [...this.queue];
        }

        this.resetReview();
        this.selectedItem = this.filteredQueue[0] || null;

        if (action === 'done') {
          this.toastService.success('The record has been updated and marked as Approved');
        } else {
          this.toastService.success('The request has been rejected and the decision has been logged');
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to update status:', err);
        this.toastService.error('Failed to update the record. Please try again.');
        this.isSubmitting = false;
        this.cdr.markForCheck();
      }
    });
  }

  cancelReview() {
    this.resetReview();
  }

  private resetReview() {
    this.reviewStep = 'idle';
    this.reviewAction = '';
    this.reviewNoteControl.reset('');
    this.buyerIdControl.reset(null);
    this.soldPriceControl.reset(null);
  }
}
