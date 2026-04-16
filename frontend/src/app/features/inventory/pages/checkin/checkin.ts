import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { catchError, finalize, throwError, timeout } from 'rxjs';
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
export class CheckinComponent implements OnInit, OnDestroy {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private svc = inject(CheckoutService);
    private toast = inject(ToastService);
    private cdr = inject(ChangeDetectorRef);

    record: CheckoutRecord | null = null;
    activeCheckouts: CheckoutRecord[] = [];
    loading = true;
    notFound = false;
    loadError = false;
    processing = false;
    submitted = false;

    checkinForm: CheckinFormData = {
        condition: 'Good',
        damageSeverity: undefined,
        repairNeeded: false,
        acknowledged: false,
        evidenceFileName: '',
        notes: '',
    };

    evidenceFileError = '';

    /* Result overlay */
    showResult = false;
    resultType: 'success' | 'error' = 'success';
    resultTitle = '';
    resultMessage = '';
    private resultAutoCloseTimer: ReturnType<typeof setTimeout> | null = null;

    ngOnInit(): void {
        this.route.queryParamMap.subscribe((params) => {
            const id = params.get('id');
            if (!id) {
                this.record = null;
                this.notFound = false;
                this.loadError = false;
                this.loadActiveCheckouts();
                return;
            }

            this.loadCheckinRecord(id);
        });
    }

    loadCheckinRecord(id: string): void {
        this.loading = true;
        this.record = null;
        this.notFound = false;
        this.loadError = false;
        this.activeCheckouts = [];

        this.svc.getById(id).pipe(
            timeout(10000),
            catchError((err) => {
                if (err?.name === 'TimeoutError') {
                    this.toast.error('Loading check-in details timed out. Please try again.');
                }
                return throwError(() => err);
            }),
            finalize(() => {
                this.loading = false;
                setTimeout(() => this.cdr.detectChanges(), 0);
            })
        ).subscribe({
            next: (rec) => {
                if (!rec || rec.status === 'Returned') {
                    this.notFound = true;
                    setTimeout(() => this.cdr.detectChanges(), 0);
                    return;
                }
                this.record = rec;
                setTimeout(() => this.cdr.detectChanges(), 0);
            },
            error: () => {
                this.toast.error('Failed to load checkout record.');
                this.loadError = true;
                setTimeout(() => this.cdr.detectChanges(), 0);
            },
        });
    }

    loadActiveCheckouts(): void {
        this.loading = true;
        this.svc.getActiveCheckouts().pipe(
            timeout(10000),
            catchError((err) => {
                if (err?.name === 'TimeoutError') {
                    this.toast.error('Loading checkout list timed out. Please try again.');
                }
                return throwError(() => err);
            }),
            finalize(() => {
                this.loading = false;
                setTimeout(() => this.cdr.detectChanges(), 0);
            })
        ).subscribe({
            next: (records) => {
                this.activeCheckouts = records;
                setTimeout(() => this.cdr.detectChanges(), 0);
            },
            error: () => {
                this.loadError = true;
                this.toast.error('Failed to load checkout records.');
                setTimeout(() => this.cdr.detectChanges(), 0);
            },
        });
    }

    retryLoad(): void {
        this.loading = true;
        this.notFound = false;
        this.loadError = false;
        this.ngOnInit();
    }

    goBack(): void {
        this.router.navigate(['/inventory/check-out']);
    }

    openCheckinRecord(record: CheckoutRecord): void {
        this.router.navigate(['/inventory/check-in'], { queryParams: { id: record.id } });
    }

    confirmCheckin(): void {
        this.submitted = true;
        if (this.processing) return;
        if (!this.checkinForm.condition) return;
        if (!this.record) return;
        if (!this.checkinForm.acknowledged) {
            this.toast.warning('Please confirm acknowledgement before check-in.');
            return;
        }

        if ((this.checkinForm.condition === 'Damaged' || this.checkinForm.repairNeeded) && !this.checkinForm.damageSeverity) {
            this.toast.warning('Please select damage severity.');
            return;
        }

        this.processing = true;
        this.svc.checkin(this.record.assetId, this.checkinForm).pipe(
            timeout(15000),
            catchError((err) => {
                if (err?.name === 'TimeoutError') {
                    this.toast.error('Check-in request timed out. Please try again.');
                }
                return throwError(() => err);
            }),
            finalize(() => {
                this.processing = false;
                setTimeout(() => this.cdr.detectChanges(), 0);
            })
        ).subscribe({
            next: (updated) => {
                this.resultType = 'success';
                this.resultTitle = 'Checked In!';
                this.resultMessage = `"${updated.assetName}" has been returned by ${updated.checkedOutTo}.`;
                this.showResult = true;
                if (this.resultAutoCloseTimer) {
                    clearTimeout(this.resultAutoCloseTimer);
                }
                this.resultAutoCloseTimer = setTimeout(() => {
                    this.onResultClosed();
                }, 2000);
                setTimeout(() => this.cdr.detectChanges(), 0);
            },
            error: () => {
                this.toast.error('Check-in failed. Please try again.');
                setTimeout(() => this.cdr.detectChanges(), 0);
            },
        });
    }

    onConditionChange(condition: 'Good' | 'Fair' | 'Damaged'): void {
        this.checkinForm.condition = condition;
        if (condition !== 'Damaged' && !this.checkinForm.repairNeeded) {
            this.checkinForm.damageSeverity = undefined;
        }
    }

    onRepairNeededChange(): void {
        if (!this.checkinForm.repairNeeded && this.checkinForm.condition !== 'Damaged') {
            this.checkinForm.damageSeverity = undefined;
        }
    }

    onEvidenceSelected(event: Event): void {
        this.evidenceFileError = '';
        const input = event.target as HTMLInputElement;
        const file = input.files && input.files.length > 0 ? input.files[0] : null;

        if (!file) {
            this.checkinForm.evidenceFileName = '';
            return;
        }

        const isImage = file.type.startsWith('image/');
        const maxSizeBytes = 5 * 1024 * 1024;

        if (!isImage) {
            this.evidenceFileError = 'Only image files are allowed.';
            this.checkinForm.evidenceFileName = '';
            input.value = '';
            return;
        }

        if (file.size > maxSizeBytes) {
            this.evidenceFileError = 'Image must be 5MB or smaller.';
            this.checkinForm.evidenceFileName = '';
            input.value = '';
            return;
        }

        this.checkinForm.evidenceFileName = file.name;
    }

    get requiresSeverity(): boolean {
        return this.checkinForm.condition === 'Damaged' || this.checkinForm.repairNeeded;
    }

    onResultClosed(): void {
        if (this.resultAutoCloseTimer) {
            clearTimeout(this.resultAutoCloseTimer);
            this.resultAutoCloseTimer = null;
        }
        this.showResult = false;
        this.router.navigate(['/inventory/check-in']);
    }

    ngOnDestroy(): void {
        if (this.resultAutoCloseTimer) {
            clearTimeout(this.resultAutoCloseTimer);
            this.resultAutoCloseTimer = null;
        }
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
