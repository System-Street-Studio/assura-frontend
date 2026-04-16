import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, forkJoin, of } from 'rxjs';
import { AssetService } from '../../services/asset.service';
import { ProductService } from '../../services/product.service';
import { SupplierService } from '../../services/supplier.service';
import { DivisionService } from '../../services/division.service';
import { CategoryService } from '../../services/category.service';
import { Asset, AssetDetail, AssetStatus } from '../../models/asset.model';
import { Product } from '../../models/product.model';
import { Supplier } from '../../models/supplier.model';
import { Division } from '../../models/division.model';
import { Category } from '../../models/category.model';
import { ToastService } from '../../../../shared/services/toast.service';
import { ResultOverlayComponent } from '../../../../shared/components/result-overlay/result-overlay';

@Component({
  selector: 'app-asset-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, ResultOverlayComponent],
  templateUrl: './asset-form.html',
  styleUrls: ['./asset-form.css'],
})
export class AssetFormComponent implements OnInit {
  private fb = inject(FormBuilder);
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
  private editingAssetNumericId = 0;

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

  assetForm = this.fb.nonNullable.group({
    assetCode: ['', [Validators.required, Validators.maxLength(50)]],
    assetTag: ['', [Validators.maxLength(50)]],
    productId: [0, [Validators.min(1)]],
    status: ['InStore' as AssetStatus, [Validators.required]],
    categoryId: [0, [Validators.min(1)]],
    supplierId: [0, [Validators.min(1)]],
    divisionId: [0, [Validators.min(1)]],
    serialNumber: ['', [Validators.maxLength(100)]],
    assetDate: [this.getTodayDateString(), [Validators.required]],
    purchaseValue: [0, [Validators.required, Validators.min(0)]],
    warranty: ['', [Validators.maxLength(200)]],
    notes: ['', [Validators.maxLength(1000)]],
  });

  ngOnInit(): void {
    this.mode = this.route.snapshot.data['mode'] || 'edit';
    this.assetId = this.route.snapshot.paramMap.get('id') || '';

    this.loadDropdownData();

    if (this.assetId) {
      this.assetService.getAssetById(this.assetId).subscribe({
        next: (a) => {
          this.editingAssetNumericId = Number(a.id) || Number(this.assetId) || 0;

          this.assetForm.patchValue({
            assetCode: a.assetCode || '',
            assetTag: a.assetTag || '',
            productId: a.productId || 0,
            status: a.status || 'InStore',
            categoryId: a.categoryId || 0,
            supplierId: a.supplierId || 0,
            divisionId: a.divisionId || 0,
            serialNumber: a.serialNumber || '',
            assetDate: this.toDateInputValue(a.assetDate),
            purchaseValue: Number(a.purchaseValue) || 0,
            warranty: a.warranty || '',
            notes: a.notes || '',
          });

          if (this.mode === 'clone') {
            this.editingAssetNumericId = 0;
            this.assetForm.patchValue({
              assetCode: `${a.assetCode}-COPY`,
              serialNumber: '',
            });
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

  get assetCodeValue(): string {
    return this.assetForm.controls.assetCode.value;
  }

  showError(controlName: keyof typeof this.assetForm.controls): boolean {
    const control = this.assetForm.controls[controlName];
    return !!control && control.invalid && (control.touched || this.submitted);
  }

  onFileChange(event: any): void { }
  removeImage(): void { }

  onSave(): void {
    this.submitted = true;
    const codeControl = this.assetForm.controls.assetCode;
    codeControl.setValue(codeControl.value.trim());

    if (this.assetForm.invalid) {
      this.assetForm.markAllAsTouched();
      this.toast.warning('Please fill all required fields with valid values.');
      return;
    }

    this.saving = true;
    const payload = this.buildAssetPayload();

    if (this.mode === 'clone' || this.mode === 'create') {
      this.assetService.createAsset(payload).subscribe({
        next: () => {
          this.saving = false;
          this.showResultOverlay('success', 'Success', `Asset saved.`, ['/inventory/assets']);
        },
        error: (err: HttpErrorResponse) => {
          this.saving = false;
          const detail = err.error?.detail || err.error?.message || err.error?.title || 'Unknown error occurred';
          this.toast.error(`Failed to save: ${detail}`);
        },
      });
    } else {
      this.assetService.updateAsset(payload).subscribe({
        next: () => {
          this.saving = false;
          this.showResultOverlay('success', 'Updated', `Asset updated.`, ['/inventory/assets']);
        },
        error: (err: HttpErrorResponse) => {
          this.saving = false;
          const detail = err.error?.detail || err.error?.message || err.error?.title || 'Unknown error occurred';
          this.toast.error(`Failed to update: ${detail}`);
        },
      });
    }
  }

  private loadDropdownData(): void {
    forkJoin({
      products: this.productService.getAll().pipe(catchError(() => of([] as Product[]))),
      suppliers: this.supplierService.getAll().pipe(catchError(() => of([] as Supplier[]))),
      divisions: this.divisionService.getAll().pipe(catchError(() => of([] as Division[]))),
      categories: this.categoryService.getAll().pipe(catchError(() => of([] as Category[]))),
    }).subscribe(({ products, suppliers, divisions, categories }) => {
      this.products = products;
      this.suppliers = suppliers;
      this.divisions = divisions;
      this.categories = categories;

      if (!products.length) this.toast.error('Failed to load products');
      if (!suppliers.length) this.toast.error('Failed to load suppliers');
      if (!divisions.length) this.toast.error('Failed to load divisions');
      if (!categories.length) this.toast.error('Failed to load categories');
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

  private buildAssetPayload(): Asset {
    const raw = this.assetForm.getRawValue();
    const id = this.mode === 'edit' ? this.editingAssetNumericId : 0;

    return {
      id,
      assetCode: raw.assetCode.trim(),
      assetTag: raw.assetTag.trim(),
      assetDate: raw.assetDate,
      status: raw.status,
      serialNumber: raw.serialNumber.trim(),
      purchaseValue: Number(raw.purchaseValue) || 0,
      warranty: raw.warranty.trim(),
      notes: raw.notes.trim(),
      categoryId: Number(raw.categoryId),
      divisionId: Number(raw.divisionId),
      productId: Number(raw.productId),
      supplierId: Number(raw.supplierId),
    };
  }

  private toDateInputValue(value: string | Date | undefined): string {
    if (!value) return this.getTodayDateString();
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return this.getTodayDateString();
    return date.toISOString().slice(0, 10);
  }

  private getTodayDateString(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
