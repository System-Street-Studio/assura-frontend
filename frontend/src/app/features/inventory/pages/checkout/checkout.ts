import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { catchError, finalize, forkJoin, of, throwError, timeout } from 'rxjs';
import { CheckoutService } from '../../services/checkout.service';
import { CheckoutRecord, CheckoutFormData, CheckoutEmployee } from '../../models/checkout.model';
import { ToastService } from '../../../../shared/services/toast.service';
import { ResultOverlayComponent } from '../../../../shared/components/result-overlay/result-overlay';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';
import { ProcurementService } from '../../../procurement/services/procurement.service';

@Component({
    selector: 'app-checkout',
    standalone: true,
    imports: [CommonModule, FormsModule, MatIconModule, ResultOverlayComponent, PaginationComponent],
    templateUrl: './checkout.html',
    styleUrls: ['./checkout.css'],
})
export class CheckoutComponent implements OnInit {
    private svc = inject(CheckoutService);
    private procurementService = inject(ProcurementService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private toast = inject(ToastService);
    private cdr = inject(ChangeDetectorRef);

    informingId: number | null = null;

    allRecords: CheckoutRecord[] = [];
    filteredRecords: CheckoutRecord[] = [];
    viewRecords: CheckoutRecord[] = [];
    loading = true;
    loadError = false;

    searchTerm = '';
    filterStatus = '';
    filterDivision = '';
    filterDueSoon = false;

    currentPage = 1;
    pageSize = 10;
    pageSizes = [5, 10, 25, 50];

    activeView: 'active' | 'history' = 'active';

    /* ── New Checkout modal ── */
    showCheckoutModal = false;
    checkoutProcessing = false;
    submitted = false;
    availableAssets: { id: string; name: string; serial: string; category: string }[] = [];
    employees: CheckoutEmployee[] = [];

    checkoutForm: CheckoutFormData = {
        assetId: '',
        checkedOutToUserId: '',
        checkedOutTo: '',
        division: '',
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
        return this.allRecords.filter((r) => this.isDueSoon(r)).length;
    }

    get divisions(): string[] {
        const depts = new Set(this.allRecords.map((r) => r.division));
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
        forkJoin({
            assets: this.svc.getAvailableAssets().pipe(catchError(() => of([]))),
            employees: this.svc.getEmployees().pipe(catchError(() => of([]))),
            arrivals: this.procurementService.getAssetInformings().pipe(catchError(() => of([]))),
        }).subscribe({
            next: ({ assets, employees, arrivals }) => {
                this.availableAssets = assets;
                this.employees = employees;

                this.route.queryParams.subscribe((params) => {
                    if (params['informingId']) {
                        this.informingId = Number(params['informingId']);
                    }
                    if (params['informingId'] || params['employeeId'] || params['item']) {
                        let empId = params['employeeId'];
                        let itemName = params['item'];

                        if (!empId && this.informingId && arrivals && arrivals.length > 0) {
                            const arrival = arrivals.find(a => a.id === this.informingId);
                            if (arrival) {
                                if (arrival.targetEmployeeId) {
                                    empId = String(arrival.targetEmployeeId);
                                } else if (arrival.divisionId || arrival.divisionName) {
                                    const divName = (arrival.divisionName || '').trim().toLowerCase();
                                    const match = this.employees.find(e =>
                                        (arrival.divisionId && e.divisionId === arrival.divisionId) ||
                                        (divName && e.division && e.division.toLowerCase() === divName)
                                    );
                                    if (match) {
                                        empId = String(match.id);
                                    }
                                }
                                if (!itemName) {
                                    itemName = arrival.itemName;
                                }
                            }
                        }

                        this.openCheckoutModal(empId, itemName);
                    }
                });
                this.cdr.detectChanges();
            },
        });
    }

    loadData(): void {
        this.loading = true;
        this.loadError = false;
        this.svc.getAll().pipe(
            timeout(10000),
            catchError((err) => {
                if (err?.name === 'TimeoutError') {
                    this.toast.error('Checkout data request timed out. Please try again.');
                }
                return throwError(() => err);
            })
        ).subscribe({
            next: (data: CheckoutRecord[]) => {
                setTimeout(() => {
                    try {
                        this.allRecords = Array.isArray(data) ? data : [];
                        this.applyFilters();
                    } catch {
                        this.allRecords = [];
                        this.filteredRecords = [];
                        this.viewRecords = [];
                    }
                    this.loading = false;
                    setTimeout(() => this.cdr.detectChanges(), 0);
                }, 0);
            },
            error: () => {
                this.loadError = true;
                this.toast.error('Failed to load checkout records.');
                this.allRecords = [];
                this.filteredRecords = [];
                this.viewRecords = [];
                this.loading = false;
                setTimeout(() => this.cdr.detectChanges(), 0);
            },
        });
    }

    retryLoad(): void {
        this.loadData();
    }

    setView(view: 'active' | 'history'): void {
        this.activeView = view;
        this.currentPage = 1;
        if (view === 'history' && this.filterStatus !== 'Returned') {
            this.filterStatus = '';
            this.filterDueSoon = false;
        } else if (view === 'active' && this.filterStatus === 'Returned') {
            this.filterStatus = '';
        }
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
                r.division.toLowerCase().includes(term);

            const matchesStatus = !this.filterStatus || r.status === this.filterStatus;
            const matchesDept = !this.filterDivision || r.division === this.filterDivision;
            const matchesDueSoon = !this.filterDueSoon || this.isDueSoon(r);

            return matchesSearch && matchesStatus && matchesDept && matchesDueSoon;
        });

        this.currentPage = 1;
        this.updateView();
    }

    clearFilters(): void {
        this.searchTerm = '';
        this.filterStatus = '';
        this.filterDivision = '';
        this.filterDueSoon = false;
        this.applyFilters();
    }

    get hasActiveFilters(): boolean {
        return !!this.searchTerm || !!this.filterStatus || !!this.filterDivision || this.filterDueSoon;
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
    openCheckoutModal(preselectEmpId?: string, preselectItem?: string): void {
        this.submitted = false;
        this.checkoutProcessing = false;

        const defaultDueDate = new Date();
        defaultDueDate.setFullYear(defaultDueDate.getFullYear() + 1);

        let preselectedAssetId = '';
        if (preselectItem && this.availableAssets.length > 0) {
            const cleanItem = preselectItem.trim().toLowerCase();
            const match = this.availableAssets.find(a =>
                a.name.toLowerCase().includes(cleanItem) ||
                cleanItem.includes(a.name.toLowerCase()) ||
                a.serial.toLowerCase().includes(cleanItem)
            );
            if (match) {
                preselectedAssetId = match.id;
            }
        }
        if (!preselectedAssetId && this.availableAssets && this.availableAssets.length > 0) {
            preselectedAssetId = this.availableAssets[0].id;
        }

        this.checkoutForm = {
            assetId: preselectedAssetId,
            checkedOutToUserId: preselectEmpId || '',
            checkedOutTo: '',
            division: '',
            email: '',
            dueDate: defaultDueDate.toISOString().slice(0, 10),
            notes: preselectItem ? `Checked out for approved arrival: ${preselectItem}` : 'Standard employee issue.'
        };
        if (preselectEmpId) {
            this.onEmployeeChange();
        }
        this.showCheckoutModal = true;
    }

    cancelCheckout(): void {
        if (this.checkoutProcessing) {
            return;
        }
        this.showCheckoutModal = false;
    }

    onEmployeeChange(): void {
        const emp = this.employees.find((e) => String(e.id) === String(this.checkoutForm.checkedOutToUserId));
        if (emp) {
            this.checkoutForm.checkedOutTo = emp.name;
            this.checkoutForm.division = emp.division;
            this.checkoutForm.email = emp.email;
        } else {
            this.checkoutForm.checkedOutTo = '';
            this.checkoutForm.division = '';
            this.checkoutForm.email = '';
        }
    }

    confirmCheckout(): void {
        this.submitted = true;
        if (
            !this.checkoutForm.assetId ||
            !this.checkoutForm.checkedOutToUserId ||
            !this.checkoutForm.dueDate
        ) {
            return;
        }

        const selectedAsset = this.availableAssets.find((a) => a.id === this.checkoutForm.assetId);
        if (!selectedAsset) {
            this.toast.warning('Selected asset is no longer available for checkout. Please choose another asset.');
            return;
        }

        this.checkoutProcessing = true;
        this.svc.checkout(this.checkoutForm).pipe(
            timeout(15000),
            catchError((err) => {
                if (err?.name === 'TimeoutError') {
                    this.toast.error('Checkout request timed out. Please try again.');
                }
                return throwError(() => err);
            }),
            finalize(() => {
                this.checkoutProcessing = false;
            })
        ).subscribe({
            next: (record: CheckoutRecord) => {
                this.showCheckoutModal = false;
                this.resultType = 'success';
                this.resultTitle = 'Checked Out!';
                this.resultMessage = `"${record.assetName}" has been checked out to ${record.checkedOutTo}.`;
                this.showResult = true;
                this.loadData();
                if (this.informingId) {
                    this.procurementService.completeArrival(this.informingId, `Checked out to ${record.checkedOutTo}`).subscribe({
                        next: () => {},
                        error: () => {}
                    });
                }
            },
            error: (err) => {
                const message = err?.error?.detail || err?.error?.Detail
                    || err?.error?.title || err?.error?.Message
                    || 'Checkout failed. Please try again.';
                this.toast.error(message);
            },
        });
    }

    /* ── Checkin action ── */
    onCheckin(record: CheckoutRecord | null): void {
        if (!record) {
            this.toast.warning('Checkout record is no longer available. Please select it again.');
            return;
        }
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
