import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CheckoutService } from '../../services/checkout.service';
import { CheckoutRecord, CheckinFormData } from '../../models/checkout.model';
import { ToastService } from '../../../../shared/services/toast.service';
import { ResultOverlayComponent } from '../../../../shared/components/result-overlay/result-overlay';

@Component({
  selector: 'app-checkin',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, ResultOverlayComponent],
  templateUrl: './checkin.html',
  styleUrls: ['./checkin.css'],
})
export class CheckinComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private svc = inject(CheckoutService);
  private toast = inject(ToastService);

  record: CheckoutRecord | null = null;
  loading = true;
  notFound = false;
  processing = false;
  submitted = false;

  checkinForm: CheckinFormData = {
    condition: 'Good',
    notes: '',
  };

  /* Result overlay */
  showResult = false;
  resultType: 'success' | 'error' = 'success';
  resultTitle = '';
  resultMessage = '';

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('id');
    if (!id) {
      this.notFound = true;
      this.loading = false;
      return;
    }

    this.svc.getById(id).subscribe({
      next: (rec) => {
        if (!rec || rec.status === 'Returned') {
          this.notFound = true;
          this.loading = false;
          return;
        }
        this.record = rec;
        this.loading = false;
      },
      error: () => {
        this.toast.error('Failed to load checkout record');
        this.loading = false;
        this.notFound = true;
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/inventory/check-out']);
  }

  confirmCheckin(): void {
    this.submitted = true;
    if (!this.checkinForm.condition) return;
    if (!this.record) return;

    this.processing = true;
    this.svc.checkin(this.record.id, this.checkinForm).subscribe({
      next: (updated) => {
        this.processing = false;
        this.resultType = 'success';
        this.resultTitle = 'Checked In!';
        this.resultMessage = `"${updated.assetName}" has been returned by ${updated.checkedOutTo}.`;
        this.showResult = true;
      },
      error: () => {
        this.processing = false;
        this.toast.error('Check-in failed. Please try again.');
      },
    });
  }

  onResultClosed(): void {
    this.showResult = false;
    this.router.navigate(['/inventory/check-out']);
  }

  /* ── Helpers ── */
  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  isOverdue(): boolean {
    if (!this.record) return false;
    return new Date(this.record.dueDate) < new Date();
  }

  getDaysInfo(): string {
    if (!this.record) return '';
    const now = new Date();
    const due = new Date(this.record.dueDate);
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `${Math.abs(diff)} days overdue`;
    if (diff === 0) return 'Due today';
    if (diff === 1) return 'Due tomorrow';
    return `${diff} days remaining`;
  }

  getDuration(): string {
    if (!this.record) return '';
    const start = new Date(this.record.checkoutDate);
    const now = new Date();
    const diffDays = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return `${diffDays} days`;
  }

  getStatusClass(): string {
    if (!this.record) return '';
    return this.record.status === 'Overdue' ? 'overdue' : 'checked-out';
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  getCategoryIcon(): string {
    if (!this.record) return 'laptop';
    const cat = this.record.category;
    if (cat === 'Mobile Devices') return 'smartphone';
    if (cat === 'Tablets') return 'tablet';
    return 'laptop';
  }

  getCategoryThumbClass(): string {
    if (!this.record) return 'laptop';
    const cat = this.record.category;
    if (cat === 'Mobile Devices') return 'phone';
    if (cat === 'Tablets') return 'tablet';
    return 'laptop';
  }
}
