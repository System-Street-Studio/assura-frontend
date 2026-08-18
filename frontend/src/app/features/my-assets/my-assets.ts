import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Asset } from './models/asset.model';
import { AssetsService } from '../../services/assets.service';

@Component({
  selector: 'app-my-assets',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './my-assets.html',
  styleUrls: ['./my-assets.css']
})
export class MyAssetsComponent implements OnInit {
  assets: Asset[] = [];
  filteredAssets: Asset[] = [];
  searchQuery: string = '';
  statusFilter = '';
  selectedAsset: Asset | null = null;
  isLoading = true;

  get activeCount() { return this.assets.filter(a => a.status === 'Active').length; }
  get maintenanceCount() { return this.assets.filter(a => a.status === 'Maintenance').length; }
  get assignedCount() { return this.assets.filter(a => a.status === 'Assigned').length; }
  get totalCount() { return this.assets.length; }
  isAddAssetModalOpen = false;
  isEditAssetModalOpen = false;
  addAssetForm: FormGroup;
  editAssetForm: FormGroup;
  editingAssetId: string | null = null;

  constructor(
    private assetsService: AssetsService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.addAssetForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      type: ['Laptop', Validators.required],
      serialNumber: ['', Validators.required],
      division: ['', Validators.required],
      status: ['Active']
    });

    this.editAssetForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      type: ['Laptop', Validators.required],
      serialNumber: ['', Validators.required],
      division: ['', Validators.required],
      status: ['Active', Validators.required]
    });
  }

  get addF() { return this.addAssetForm.controls; }
  get editF() { return this.editAssetForm.controls; }

  ngOnInit() {
    this.assetsService.getAll().subscribe({
      next: (data) => {
        this.assets = data;
        this.applyFilters();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load assets:', err);
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onSearch() {
    this.applyFilters();
  }

  filterByStatus(status: string) {
    this.statusFilter = this.statusFilter === status ? '' : status;
    this.applyFilters();
  }

  private applyFilters() {
    const query = this.searchQuery.toLowerCase();
    this.filteredAssets = this.assets.filter(asset => {
      const matchesSearch =
        (asset.name ?? '').toLowerCase().includes(query) ||
        (asset.serialNumber ?? '').toLowerCase().includes(query);
      const matchesStatus = !this.statusFilter || asset.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  selectAsset(asset: Asset) {
    this.selectedAsset = asset;
  }

  closeDetail() {
    this.selectedAsset = null;
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  openAddAssetModal() {
    this.addAssetForm.reset({ name: '', type: 'Laptop', serialNumber: '', division: '', status: 'Active' });
    this.isAddAssetModalOpen = true;
  }

  closeAddAssetModal() {
    this.isAddAssetModalOpen = false;
  }

  submitAddAsset() {
    if (this.addAssetForm.invalid) {
      this.addAssetForm.markAllAsTouched();
      return;
    }

    this.assetsService.create(this.addAssetForm.value).subscribe({
      next: () => {
        // Fetch fresh list from backend
        this.assetsService.getAll().subscribe({
          next: (data) => {
            this.assets = data;
            this.onSearch(); // Refresh the list with filters
            this.closeAddAssetModal();
            this.cdr.markForCheck();
          }
        });
      },
      error: (err) => {
        console.error('Failed to create asset:', err);
        alert('Failed to add asset. Please try again.');
        this.cdr.markForCheck();
      }
    });
  }

  openEditAssetModal(asset: Asset) {
    this.editingAssetId = asset.id;
    this.editAssetForm.reset({
      name: asset.name,
      type: asset.type,
      serialNumber: asset.serialNumber,
      division: asset.division,
      status: asset.status
    });
    this.isEditAssetModalOpen = true;
    this.selectedAsset = null; // Close detail modal
  }

  closeEditAssetModal() {
    this.isEditAssetModalOpen = false;
    this.editingAssetId = null;
  }

  submitEditAsset() {
    if (!this.editingAssetId || this.editAssetForm.invalid) {
      this.editAssetForm.markAllAsTouched();
      return;
    }

    this.assetsService.update(this.editingAssetId, this.editAssetForm.value).subscribe({
      next: () => {
        this.assetsService.getAll().subscribe({
          next: (data) => {
            this.assets = data;
            this.onSearch();
            this.closeEditAssetModal();
            this.cdr.markForCheck();
          }
        });
      },
      error: (err) => {
        console.error('Failed to update asset:', err);
        alert('Failed to update asset. Please try again.');
        this.cdr.markForCheck();
      }
    });
  }
}
