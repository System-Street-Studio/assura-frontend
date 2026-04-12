import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AssetService } from '../../services/asset.service';
import { ProductService } from '../../services/product.service';
import { SupplierService } from '../../services/supplier.service';
import { DivisionService } from '../../services/division.service';
import { CategoryService } from '../../services/category.service';
import { AssetDetail, AssetStatus } from '../../models/asset.model';
import { Product } from '../../models/product.model';
import { Supplier } from '../../models/supplier.model';
import { Division } from '../../models/division.model';
import { Category } from '../../models/category.model';
import { ToastService } from '../../../../shared/services/toast.service';
import { ResultOverlayComponent } from '../../../../shared/components/result-overlay/result-overlay';

@Component({
  selector: 'app-asset-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, ResultOverlayComponent],
  templateUrl: './asset-form.html',
  styleUrls: ['./asset-form.css'],
})
export class AssetFormComponent implements OnInit {
  private assetService = inject(AssetService);
  private productService = inject(ProductService);
  private supplierService = inject(SupplierService);
  private divisionService = inject(DivisionService);
  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private toast = inject(ToastService);

  mode: 'edit' | 'clone' | 'create' = 'edit';
  assetId = '';
  saving = false;
  submitted = false;

  // Compatibility properties
  imagePreview: string | null = null;
  auditSchedules = ['Monthly', 'Quarterly', 'Semi-Annually', 'Annually'];

  showResult = false;
  resultType: 'success' | 'error' = 'success';
  resultTitle = '';
  resultMessage = '';
  private navigateTarget: string[] = [];

  statuses: AssetStatus[] = ['InUse', 'InStore', 'UnderMaintenance', 'Discarded', 'Transferred', 'Lost'];

  products: Product[] = [];
  suppliers: Supplier[] = [];
  divisions: Division[] = [];
  categories: Category[] = [];

  form: AssetDetail = {
    id: '',
    assetCode: '',
    assetTag: '',
    assetDate: '',
    status: 'InStore',
    serialNumber: '',
    purchaseValue: 0,
    warranty: '',
    notes: '',
    categoryId: 0,
    divisionId: 0,
    productId: 0,
    supplierId: 0,
    productName: '',
    categoryName: '',
    divisionName: '',
    supplierName: ''
  };

  ngOnInit(): void {
    this.mode = this.route.snapshot.data['mode'] || 'edit';
    this.assetId = this.route.snapshot.paramMap.get('id') || '';

    this.loadDropdownData();

    if (this.assetId) {
      this.assetService.getAssetById(this.assetId).subscribe({
        next: (a) => {
          this.form = { ...a };
          // Fill aliases for form logic if needed
          this.form.serial = a.serialNumber;
          this.form.purchaseCost = a.purchaseValue;

          if (this.mode === 'clone') {
            this.form.id = '';
            this.form.assetCode = a.assetCode + '-COPY';
          }
        },
        error: () => {
          this.toast.error('Failed to load asset');
          this.location.back();
        },
      });
    }
  }

  get pageTitle(): string {
    if (this.mode === 'clone') return 'Clone Asset';
    if (this.mode === 'create') return 'New Asset';
    return 'Edit Asset';
  }

  onFileChange(event: any): void { }
  removeImage(): void { }

  onSave(): void {
    this.submitted = true;
    if (!this.form.assetCode.trim() || !this.form.productId || !this.form.status) {
      this.toast.warning('Please fill in all required fields');
      return;
    }
    this.saving = true;

    // Sync values from aliases if template uses them
    if (this.form.serial) this.form.serialNumber = this.form.serial;
    if (this.form.purchaseCost) this.form.purchaseValue = this.form.purchaseCost;

    if (this.mode === 'clone' || this.mode === 'create') {
      this.assetService.createAsset(this.form).subscribe({
        next: (created) => {
          this.saving = false;
          this.showResultOverlay('success', 'Success', `Asset saved.`, ['/inventory/assets']);
        },
        error: () => {
          this.saving = false;
          this.toast.error('Failed to save asset');
        },
      });
    } else {
      this.assetService.updateAsset(this.form).subscribe({
        next: () => {
          this.saving = false;
          this.showResultOverlay('success', 'Updated', `Asset updated.`, ['/inventory/assets']);
        },
        error: () => {
          this.saving = false;
          this.toast.error('Failed to save changes');
        },
      });
    }
  }

  private loadDropdownData(): void {
    this.productService.getAll().subscribe({
      next: (data) => this.products = data,
      error: () => this.toast.error('Failed to load products')
    });
    this.supplierService.getAll().subscribe({
      next: (data) => this.suppliers = data,
      error: () => this.toast.error('Failed to load suppliers')
    });
    this.divisionService.getAll().subscribe({
      next: (data) => this.divisions = data,
      error: () => this.toast.error('Failed to load divisions')
    });
    this.categoryService.getAll().subscribe({
      next: (data) => this.categories = data,
      error: () => this.toast.error('Failed to load categories')
    });
  }

  onCancel(): void {
    this.location.back();
  }

  onResultClosed(): void {
    this.showResult = false;
    if (this.navigateTarget.length) {
      this.router.navigate(this.navigateTarget);
    }
  }

  private showResultOverlay(type: 'success' | 'error', title: string, message: string, navigateTo: string[]): void {
    this.resultType = type;
    this.resultTitle = title;
    this.resultMessage = message;
    this.navigateTarget = navigateTo;
    this.showResult = true;
    setTimeout(() => this.onResultClosed(), 2000);
  }
}
