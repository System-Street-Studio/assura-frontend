import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CheckoutService } from '../../services/checkout.service';
import { CheckoutRecord, CheckoutFormData } from '../../models/checkout.model';
import { ToastService } from '../../../../shared/services/toast.service';
import { ResultOverlayComponent } from '../../../../shared/components/result-overlay/result-overlay';

@Component({
    selector: 'app-checkout',
    standalone: true,
    imports: [CommonModule, FormsModule, MatIconModule, ResultOverlayComponent],
    templateUrl: './checkout.html',
    styleUrls: ['./checkout.css'],
})
export class CheckoutComponent implements OnInit {
    private svc = inject(CheckoutService);
    private router = inject(Router);
    private toast = inject(ToastService);

    allRecords: CheckoutRecord[] = [];
    filteredRecords: CheckoutRecord[] = [];
    viewRecords: CheckoutRecord[] = [];
    loading = true;

    searchTerm = '';
    filterStatus = '';
    filterDepartment = '';

    currentPage = 1;
    pageSize = 10;
    pageSizes = [5, 10, 25, 50];

    activeView: 'active' | 'history' = 'active';

    /* ── New Checkout modal ── */
    showCheckoutModal = false;
    checkoutProcessing = false;
    submitted = false;
    availableAssets: { id: string; name: string; serial: string; category: string }[] = [];
    employees: { name: string; department: string; email: string }[] = [];

    checkoutForm: CheckoutFormData = {
        assetId: '',
        checkedOutTo: '',
        department: '',
        email: '',
        dueDate: '',
        notes: '',
    };

    /* ── Detail drawer ── */
    showDetail = false;
    detailRecord: CheckoutRecord | null = null;

    /* ── Result overlay ── */
    showResult = false;
    resultType: 'success' | 'error' = 'success';
    resultTitle = '';
    resultMessage = '';

    /* ── Stats ── */
    get totalCount(): number {
        return this.allRecords.length;
    }

    get activeCount(): number {
        return this.allRecords.filter((r) => r.status === 'Checked Out').length;
    }

    get overdueCount(): number {
        return this.allRecords.filter((r) => r.status === 'Overdue').length;
    }

    get returnedCount(): number {
        return this.allRecords.filter((r) => r.status === 'Returned').length;
    }

    get dueSoonCount(): number {
        const now = new Date();
        const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        return this.allRecords.filter(
            (r) => r.status === 'Checked Out' && new Date(r.dueDate) <= threeDays && new Date(r.dueDate) >= now
        ).length;
    }

    get departments(): string[] {
        const depts = new Set(this.allRecords.map((r) => r.department));
        return Array.from(depts).sort();
    }

    get totalPages(): number {
        return Math.ceil(this.filteredRecords.length / this.pageSize) || 1;
    }

    get pages(): number[] {
        return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }

    get showingFrom(): number {
        return this.filteredRecords.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
    }

    get showingTo(): number {
        return Math.min(this.currentPage * this.pageSize, this.filteredRecords.length);
    }

    get selectedCount(): number {
        return this.viewRecords.filter((r) => r.selected).length;
    }

    get allSelected(): boolean {
        return this.viewRecords.length > 0 && this.viewRecords.every((r) => r.selected);
    }

    ngOnInit(): void {
        this.loadData();
        this.svc.getAvailableAssets().subscribe((a) => (this.availableAssets = a));
        this.svc.getEmployees().subscribe((e) => (this.employees = e));
    }

    loadData(): void {
        this.loading = true;
        this.svc.getAll().subscribe({
            next: (data: CheckoutRecord[]) => {
                this.allRecords = data;
                this.applyFilters();
                this.loading = false;
            },
            error: () => {
                this.toast.error('Failed to load checkout records');
                this.loading = false;
            },
        });
    }

    setView(view: 'active' | 'history'): void {
        this.activeView = view;
        this.currentPage = 1;
        this.applyFilters();
    }

    /* ── Filtering ── */
    applyFilters(): void {
        const term = this.searchTerm.toLowerCase().trim();

        let base = this.allRecords;
        if (this.activeView === 'active') {
            base = base.filter((r) => r.status !== 'Returned');
        } else {
            base = base.filter((r) => r.status === 'Returned');
        }

        this.filteredRecords = base.filter((r) => {
            const matchesSearch =
                !term ||
                r.id.toLowerCase().includes(term) ||
                r.assetName.toLowerCase().includes(term) ||
                r.assetId.toLowerCase().includes(term) ||
                r.checkedOutTo.toLowerCase().includes(term) ||
                r.serial.toLowerCase().includes(term) ||
                r.department.toLowerCase().includes(term);

            const matchesStatus = !this.filterStatus || r.status === this.filterStatus;
            const matchesDept = !this.filterDepartment || r.department === this.filterDepartment;

            return matchesSearch && matchesStatus && matchesDept;
        });

        this.currentPage = 1;
        this.updateView();
    }

    clearFilters(): void {
        this.searchTerm = '';
        this.filterStatus = '';
        this.filterDepartment = '';
        this.applyFilters();
    }

    get hasActiveFilters(): boolean {
        return !!this.searchTerm || !!this.filterStatus || !!this.filterDepartment;
    }

    /* ── Pagination ── */
    updateView(): void {
        const start = (this.currentPage - 1) * this.pageSize;
        this.viewRecords = this.filteredRecords.slice(start, start + this.pageSize);
    }

    goToPage(page: number): void {
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
        this.updateView();
    }

    onPageSizeChange(): void {
        this.currentPage = 1;
        this.updateView();
    }

    /* ── Selection ── */
    toggleSelectAll(): void {
        const target = !this.allSelected;
        this.viewRecords.forEach((r) => (r.selected = target));
    }

    clearSelection(): void {
        this.allRecords.forEach((r) => (r.selected = false));
    }

    /* ── New Checkout ── */
    openCheckoutModal(): void {
        this.submitted = false;
        this.checkoutForm = { assetId: '', checkedOutTo: '', department: '', email: '', dueDate: '', notes: '' };
        this.showCheckoutModal = true;
    }

    cancelCheckout(): void {
        this.showCheckoutModal = false;
    }

    onEmployeeChange(): void {
        const emp = this.employees.find((e) => e.name === this.checkoutForm.checkedOutTo);
        if (emp) {
            this.checkoutForm.department = emp.department;
            this.checkoutForm.email = emp.email;
        }
    }

    confirmCheckout(): void {
        this.submitted = true;
        if (
            !this.checkoutForm.assetId ||
            !this.checkoutForm.checkedOutTo ||
            !this.checkoutForm.dueDate
        ) {
            return;
        }

        this.checkoutProcessing = true;
        this.svc.checkout(this.checkoutForm).subscribe({
            next: (record: CheckoutRecord) => {
                this.showCheckoutModal = false;
                this.checkoutProcessing = false;
                this.resultType = 'success';
                this.resultTitle = 'Checked Out!';
                this.resultMessage = `"${record.assetName}" has been checked out to ${record.checkedOutTo}.`;
                this.showResult = true;
                this.loadData();
            },
            error: () => {
                this.checkoutProcessing = false;
                this.toast.error('Checkout failed. Please try again.');
            },
        });
    }

    /* ── Checkin action ── */
    onCheckin(record: CheckoutRecord): void {
        this.router.navigate(['/inventory/check-in'], { queryParams: { id: record.id } });
    }

    /* ── Detail drawer ── */
    openDetail(record: CheckoutRecord): void {
        this.detailRecord = record;
        this.showDetail = true;
    }

    closeDetail(): void {
        this.showDetail = false;
        this.detailRecord = null;
    }

    /* ── Result overlay ── */
    onResultClosed(): void {
        this.showResult = false;
    }

    /* ── Helpers ── */
    getStatusClass(status: string): string {
        const map: Record<string, string> = {
            'Checked Out': 'checked-out',
            Returned: 'returned',
            Overdue: 'overdue',
        };
        return map[status] || '';
    }

    getConditionClass(condition: string | undefined): string {
        if (!condition) return '';
        const map: Record<string, string> = { Good: 'good', Fair: 'fair', Damaged: 'damaged' };
        return map[condition] || '';
    }

    getConditionIcon(condition: string | undefined): string {
        if (!condition) return 'help_outline';
        const map: Record<string, string> = { Good: 'check_circle', Fair: 'info', Damaged: 'warning' };
        return map[condition] || 'help_outline';
    }

    isOverdue(record: CheckoutRecord): boolean {
        if (record.status === 'Returned') return false;
        return new Date(record.dueDate) < new Date();
    }

    isDueSoon(record: CheckoutRecord): boolean {
        if (record.status !== 'Checked Out') return false;
        const now = new Date();
        const due = new Date(record.dueDate);
        const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 3;
    }

    getDaysInfo(record: CheckoutRecord): string {
        if (record.status === 'Returned') return '';
        const now = new Date();
        const due = new Date(record.dueDate);
        const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diff < 0) return `${Math.abs(diff)}d overdue`;
        if (diff === 0) return 'Due today';
        if (diff === 1) return 'Due tomorrow';
        return `${diff}d remaining`;
    }

    formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    }

    getTimeAgo(dateStr: string): string {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
        return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
    }

    getInitials(name: string): string {
        return name
            .split(' ')
            .map((w) => w[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
    }

    getAvatarClass(id: string): string {
        const num = parseInt(id.replace('CHK-', ''), 10) || 0;
        const variants = ['av-teal', 'av-blue', 'av-purple', 'av-emerald', 'av-orange', 'av-rose'];
        return variants[num % variants.length];
    }

    getMinDate(): string {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    }
}
