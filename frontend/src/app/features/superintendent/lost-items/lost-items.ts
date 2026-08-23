import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LostItemsService, LostItem } from '../../../services/lost-items.service';
import { AssetsService } from '../../../services/assets.service';
import { Asset } from '../../my-assets/models/asset.model';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
    selector: 'app-lost-items',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './lost-items.html',
    styleUrls: ['./lost-items.css']
})
export class LostItemsComponent implements OnInit {
    items: LostItem[] = [];
    availableAssets: Asset[] = [];
    selectedItem: LostItem | null = null;
    isLoading = true;
    isSubmitting = false;
    isUpdatingStatus = false;

    showReportModal = false;
    reportForm: FormGroup;

    assetSearchTerm = '';
    filteredAssets: Asset[] = [];
    showSuggestions = false;

    constructor(
        private lostItemsService: LostItemsService,
        private assetsService: AssetsService,
        private cdr: ChangeDetectorRef,
        private toastService: ToastService,
        private fb: FormBuilder
    ) {
        this.reportForm = this.fb.group({
            assetId: [null],
            assetName: ['', [Validators.required, Validators.maxLength(200)]],
            division: ['', [Validators.required, Validators.maxLength(100)]],
            assetType: ['', [Validators.maxLength(100)]],
            description: ['', [Validators.maxLength(1000)]]
        });
    }

    get f() { return this.reportForm.controls; }

    ngOnInit() {
        this.loadItems();
        this.loadAssets();
    }

    loadAssets() {
        this.assetsService.getAll().subscribe({
            next: (data) => {
                this.availableAssets = data || [];
                this.cdr.markForCheck();
            },
            error: (err) => console.error('Failed to load assets for select:', err)
        });
    }

    loadItems() {
        this.isLoading = true;
        this.lostItemsService.getAll().subscribe({
            next: (data) => {
                this.items = data;
                if (this.selectedItem) {
                    this.selectedItem = this.items.find(i => i.id === this.selectedItem!.id) ?? null;
                }
                this.isLoading = false;
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error('Failed to load lost items:', err);
                this.isLoading = false;
                this.cdr.markForCheck();
            }
        });
    }

    selectItem(item: LostItem) {
        this.selectedItem = item;
    }

    closeDetail() {
        this.selectedItem = null;
    }

    getStatusClass(status: string): string {
        if (status === 'Reported') return 'reported';
        if (status === 'Under Investigation') return 'investigating';
        if (status === 'Confirmed Lost') return 'confirmed';
        return '';
    }

    openReportModal() {
        this.reportForm.reset({ assetId: null, assetName: '', division: '', assetType: '', description: '' });
        this.assetSearchTerm = '';
        this.filteredAssets = [];
        this.showSuggestions = false;
        this.loadAssets();
        this.showReportModal = true;
    }

    closeReportModal() {
        this.showReportModal = false;
    }

    getAssetName(asset: any): string {
        if (!asset) return '';
        return asset.name || asset.productName || asset.assetName || asset.assetCode || `Asset #${asset.id}`;
    }

    getAssetDivision(asset: any): string {
        if (!asset) return '';
        return asset.division || asset.divisionName || '';
    }

    getAssetType(asset: any): string {
        if (!asset) return '';
        return asset.type || asset.categoryName || asset.assetType || '';
    }

    onAssetSearchInput() {
        const term = (this.assetSearchTerm || '').trim().toLowerCase();
        if (!term) {
            this.filteredAssets = [];
            this.showSuggestions = false;
            this.reportForm.patchValue({
                assetId: null,
                assetName: '',
                division: '',
                assetType: ''
            });
            this.cdr.markForCheck();
            return;
        }

        this.filteredAssets = this.availableAssets.filter((a: any) => {
            const idStr = (a.id ?? '').toString().toLowerCase();
            const codeStr = (a.assetCode ?? '').toLowerCase();
            const nameStr = this.getAssetName(a).toLowerCase();
            const serialStr = (a.serialNumber ?? '').toLowerCase();
            const divStr = this.getAssetDivision(a).toLowerCase();

            return idStr.includes(term) ||
                   codeStr.includes(term) ||
                   nameStr.includes(term) ||
                   serialStr.includes(term) ||
                   divStr.includes(term);
        });
        this.showSuggestions = true;
        this.cdr.markForCheck();
    }

    selectSuggestedAsset(asset: any) {
        const name = this.getAssetName(asset);
        const division = this.getAssetDivision(asset);
        const type = this.getAssetType(asset);

        this.assetSearchTerm = `[ID: ${asset.id}] ${name}`;
        this.showSuggestions = false;

        this.reportForm.patchValue({
            assetId: parseInt(asset.id, 10) || null,
            assetName: name,
            division: division,
            assetType: type
        });

        this.cdr.markForCheck();
    }

    hideSuggestionsWithDelay() {
        setTimeout(() => {
            this.showSuggestions = false;
            this.cdr.markForCheck();
        }, 200);
    }

    submitReport() {
        if (this.reportForm.invalid) {
            this.reportForm.markAllAsTouched();
            return;
        }
        this.isSubmitting = true;
        const formVal = this.reportForm.value;
        this.lostItemsService.create({
            assetId: formVal.assetId ? Number(formVal.assetId) : null,
            assetName: (formVal.assetName ?? '').trim(),
            division: (formVal.division ?? '').trim(),
            assetType: (formVal.assetType ?? '').trim(),
            description: (formVal.description ?? '').trim()
        }).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.showReportModal = false;
                this.toastService.success('Lost asset reported.');
                this.loadItems();
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error('Failed to report lost asset:', err);
                this.isSubmitting = false;
                this.toastService.error('Failed to report lost asset. Please try again.');
                this.cdr.markForCheck();
            }
        });
    }

    startInvestigation(item: LostItem) {
        this.updateStatus(item, 'UnderInvestigation', 'Marked as under investigation.');
    }

    confirmLost(item: LostItem) {
        this.updateStatus(item, 'ConfirmedLost', 'Loss confirmed — asset marked as Lost.');
    }

    private updateStatus(item: LostItem, status: string, successMessage: string) {
        this.isUpdatingStatus = true;
        this.lostItemsService.updateStatus(item.id, status).subscribe({
            next: () => {
                this.isUpdatingStatus = false;
                this.toastService.success(successMessage);
                this.loadItems();
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error('Failed to update lost item status:', err);
                this.isUpdatingStatus = false;
                this.toastService.error('Failed to update status. Please try again.');
                this.cdr.markForCheck();
            }
        });
    }
}
