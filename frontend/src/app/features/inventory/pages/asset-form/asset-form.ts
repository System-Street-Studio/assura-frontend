// ─────────────────────────────────────────────────────────────────────────────
// Angular core & common imports
// ─────────────────────────────────────────────────────────────────────────────
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { HttpErrorResponse } from '@angular/common/http';

// forkJoin: Runs multiple observables in parallel and emits when all complete.
// catchError: Handles errors gracefully per-stream so one failure doesn't block others.
// of: Creates an observable that emits a single value immediately (used as a fallback).
import { catchError, forkJoin, of } from 'rxjs';

// ─────────────────────────────────────────────────────────────────────────────
// Feature services — each handles API calls for its respective domain entity
// ─────────────────────────────────────────────────────────────────────────────
import { AssetService } from '../../services/asset.service';
import { ProductService } from '../../services/product.service';
import { SupplierService } from '../../services/supplier.service';
import { DivisionService } from '../../services/division.service';
import { CategoryService } from '../../services/category.service';

// ─────────────────────────────────────────────────────────────────────────────
// Domain models
// ─────────────────────────────────────────────────────────────────────────────
import { Asset, AssetDetail, AssetStatus } from '../../models/asset.model';
import { Product } from '../../models/product.model';
import { Supplier } from '../../models/supplier.model';
import { Division } from '../../models/division.model';
import { Category } from '../../models/category.model';

// ─────────────────────────────────────────────────────────────────────────────
// Shared services & components
// ─────────────────────────────────────────────────────────────────────────────
import { ToastService } from '../../../../shared/services/toast.service';
import { ResultOverlayComponent } from '../../../../shared/components/result-overlay/result-overlay';

@Component({
  selector: 'app-asset-form',
  standalone: true,
  // ReactiveFormsModule is required for [formGroup] and formControlName bindings in the template.
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, ResultOverlayComponent],
  templateUrl: './asset-form.html',
  styleUrls: ['./asset-form.css'],
})
/**
 * AssetFormComponent is a shared form page used for three operations:
 *  - 'create' : Creates a brand-new asset from scratch.
 *  - 'edit'   : Loads an existing asset by ID and allows the user to modify its fields.
 *  - 'clone'  : Loads an existing asset and pre-fills the form so a near-identical copy can be saved.
 *
 * The 'mode' is passed through Angular route data (e.g., `{ data: { mode: 'edit' } }` in the route config).
 */
export class AssetFormComponent implements OnInit {
  // ── Dependency injection via inject() (Angular 14+ functional style) ──
  private fb = inject(FormBuilder);               // Builds the reactive form group
  private assetService = inject(AssetService);    // Handles asset CRUD API calls
  private productService = inject(ProductService);
  private supplierService = inject(SupplierService);
  private divisionService = inject(DivisionService);
  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);         // Reads route params (e.g., :id) and data (e.g., mode)
  private router = inject(Router);               // Navigates programmatically after save/cancel
  private location = inject(Location);           // Enables browser-native "back" navigation
  private toast = inject(ToastService);          // Shows non-blocking notification toasts

  // ── Component state ──
  /** Determines whether the form is in create, edit, or clone mode. Defaults to 'edit'. */
  mode: 'edit' | 'clone' | 'create' = 'edit';

  /** String representation of the asset ID from the route (e.g., '/assets/42/edit' → '42'). */
  assetId = '';

  /** True while the save API call is in-flight, disabling the submit button. */
  saving = false;

  /** Tracks whether the form was ever submitted; used to show validation errors even for untouched fields. */
  submitted = false;

  /**
   * The numeric database ID of the asset currently being edited.
   * Kept private because it should not be displayed in the template.
   * Set to 0 for create/clone operations (new asset).
   */
  private editingAssetNumericId = 0;

  // ── Compatibility / UI properties ──
  /** Stores a base64 image preview URL if an image is selected. Currently a stub (not fully implemented). */
  imagePreview: string | null = null;

  /** Dropdown options for the audit schedule field. Currently reserved for future use. */
  auditSchedules = ['Monthly', 'Quarterly', 'Semi-Annually', 'Annually'];

  // ── Result overlay state ──
  /** Controls visibility of the full-screen success/error result overlay. */
  showResult = false;
  resultType: 'success' | 'error' = 'success';
  resultTitle = '';
  resultMessage = '';

  /** Route path to navigate to after the result overlay is dismissed. */
  private navigateTarget: string[] = [];

  // ── Dropdown data ──
  /** All possible asset lifecycle statuses. */
  statuses: AssetStatus[] = ['InUse', 'InStore', 'UnderMaintenance', 'Discarded', 'Transferred', 'Lost'];

  /** Lists populated from the backend on init, bound to <select> dropdowns in the template. */
  products: Product[] = [];
  suppliers: Supplier[] = [];
  divisions: Division[] = [];
  categories: Category[] = [];

  // ── Reactive Form Definition ──
  /**
   * The main form group built using Angular's FormBuilder.
   * `nonNullable` ensures that calling `reset()` restores the initial values instead of setting null.
   *
   * Validators used:
   *  - `Validators.required`     : Field must not be empty.
   *  - `Validators.maxLength(n)` : Prevents strings longer than n characters.
   *  - `Validators.min(1)`       : For FK dropdowns — ensures '0 (Select...)' placeholder is not submitted.
   *  - `Validators.min(0)`       : For monetary values — prevents negative numbers.
   */
  assetForm = this.fb.nonNullable.group({
    assetCode:     ['', [Validators.required, Validators.maxLength(50)]],
    assetTag:      ['', [Validators.maxLength(50)]],
    productId:     [0, [Validators.min(1)]],    // 0 = "Select Product" placeholder; min(1) enforces a real selection
    status:        ['InStore' as AssetStatus, [Validators.required]],
    categoryId:    [0, [Validators.min(1)]],
    supplierId:    [0, [Validators.min(1)]],
    divisionId:    [0, [Validators.min(1)]],
    serialNumber:  ['', [Validators.maxLength(100)]],
    assetDate:     [this.getTodayDateString(), [Validators.required]], // Defaults to today's date
    purchaseValue: [0, [Validators.required, Validators.min(0)]],
    warranty:      ['', [Validators.maxLength(200)]],
    notes:         ['', [Validators.maxLength(1000)]],
  });

  /**
   * Lifecycle hook — runs once when the component is created.
   * 1. Reads the form mode and asset ID from the route.
   * 2. Kicks off parallel dropdown data loading.
   * 3. If an asset ID is present (edit/clone), fetches and patches the form with existing data.
   */
  ngOnInit(): void {
    // 'mode' is injected via the route's `data` property in the routing module
    this.mode = this.route.snapshot.data['mode'] || 'edit';
    this.assetId = this.route.snapshot.paramMap.get('id') || '';

    this.loadDropdownData();

    if (this.assetId) {
      this.assetService.getAssetById(this.assetId).subscribe({
        next: (a) => {
          // Store the numeric ID so it can be included in the update payload later
          this.editingAssetNumericId = Number(a.id) || Number(this.assetId) || 0;

          // Patch all form fields with values from the fetched asset
          this.assetForm.patchValue({
            assetCode:     a.assetCode || '',
            assetTag:      a.assetTag || '',
            productId:     a.productId || 0,
            status:        a.status || 'InStore',
            categoryId:    a.categoryId || 0,
            supplierId:    a.supplierId || 0,
            divisionId:    a.divisionId || 0,
            serialNumber:  a.serialNumber || '',
            assetDate:     this.toDateInputValue(a.assetDate),  // Normalise to 'YYYY-MM-DD' for <input type="date">
            purchaseValue: Number(a.purchaseValue) || 0,
            warranty:      a.warranty || '',
            notes:         a.notes || '',
          });

          // For clone mode: reset the ID so a new record is created, and modify the code to signal it's a copy
          if (this.mode === 'clone') {
            this.editingAssetNumericId = 0;
            this.assetForm.patchValue({
              assetCode:    `${a.assetCode}-COPY`,
              serialNumber: '',  // Serial number must be unique; clear it to prevent duplicates
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

  // ── Computed getters (used in the template) ──

  /** Returns a human-readable page title based on the current mode. */
  get pageTitle(): string {
    if (this.mode === 'clone')  return 'Clone Asset';
    if (this.mode === 'create') return 'New Asset';
    return 'Edit Asset';
  }

  /** Returns the current value of the assetCode field, used to display the live badge in the header. */
  get assetCodeValue(): string {
    return this.assetForm.controls.assetCode.value;
  }

  /**
   * Determines whether to show a validation error for a specific form control.
   * An error is shown only after the user has interacted with the field OR clicked Submit.
   * @param controlName - Key of the form control to check.
   */
  showError(controlName: keyof typeof this.assetForm.controls): boolean {
    const control = this.assetForm.controls[controlName];
    return !!control && control.invalid && (control.touched || this.submitted);
  }

  // ── Stub methods for future image upload feature ──
  /** Handles file input changes. Placeholder — image upload not yet fully implemented. */
  onFileChange(event: any): void { }

  /** Removes the current image preview. Placeholder — image upload not yet fully implemented. */
  removeImage(): void { }

  /**
   * Handles the form submission.
   * 1. Marks the form as submitted (triggers error display for untouched invalid fields).
   * 2. Trims whitespace from the asset code.
   * 3. If the form is valid, builds the payload and calls the appropriate API (create or update).
   */
  onSave(): void {
    this.submitted = true;
    const codeControl = this.assetForm.controls.assetCode;
    codeControl.setValue(codeControl.value.trim()); // Strip accidental leading/trailing spaces

    if (this.assetForm.invalid) {
      this.assetForm.markAllAsTouched(); // Force validation styling on all fields
      this.toast.warning('Please fill all required fields with valid values.');
      return;
    }

    this.saving = true;
    const payload = this.buildAssetPayload();

    if (this.mode === 'clone' || this.mode === 'create') {
      // POST — create a new asset record
      this.assetService.createAsset(payload).subscribe({
        next: () => {
          this.saving = false;
          this.showResultOverlay('success', 'Success', `Asset saved.`, ['/inventory/assets']);
        },
        error: (err: HttpErrorResponse) => {
          this.saving = false;
          // Attempt to extract a meaningful error message from common backend response shapes
          const detail = err.error?.detail || err.error?.message || err.error?.title || 'Unknown error occurred';
          this.toast.error(`Failed to save: ${detail}`);
        },
      });
    } else {
      // PUT — update the existing asset record
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

  /**
   * Loads all dropdown reference data (products, suppliers, divisions, categories) in parallel.
   * Uses `forkJoin` so the UI is populated in a single rendering pass.
   * Each individual stream has a `catchError` fallback to an empty array, ensuring that a
   * single failing endpoint does not prevent the others from loading.
   */
  private loadDropdownData(): void {
    forkJoin({
      products:   this.productService.getAll().pipe(catchError(() => of([] as Product[]))),
      suppliers:  this.supplierService.getAll().pipe(catchError(() => of([] as Supplier[]))),
      divisions:  this.divisionService.getAll().pipe(catchError(() => of([] as Division[]))),
      categories: this.categoryService.getAll().pipe(catchError(() => of([] as Category[]))),
    }).subscribe(({ products, suppliers, divisions, categories }) => {
      this.products   = products;
      this.suppliers  = suppliers;
      this.divisions  = divisions;
      this.categories = categories;

      // Warn the user if any list came back empty (likely a backend error or empty database table)
      if (!products.length)   this.toast.error('Failed to load products');
      if (!suppliers.length)  this.toast.error('Failed to load suppliers');
      if (!divisions.length)  this.toast.error('Failed to load divisions');
      if (!categories.length) this.toast.error('Failed to load categories');
    });
  }

  /** Navigates back to the previous page without saving. */
  onCancel(): void {
    this.location.back();
  }

  /**
   * Called when the result overlay is dismissed by the user.
   * Hides the overlay and performs the pending navigation (e.g., back to assets list).
   */
  onResultClosed(): void {
    this.showResult = false;
    if (this.navigateTarget.length) {
      this.router.navigate(this.navigateTarget);
    }
  }

  /**
   * Sets up the result overlay state and auto-dismisses it after 2 seconds.
   * @param type       - 'success' or 'error' — controls the overlay icon and colour.
   * @param title      - Short headline shown on the overlay (e.g., 'Updated').
   * @param message    - Longer detail message shown below the title.
   * @param navigateTo - Route to navigate to when the overlay is closed.
   */
  private showResultOverlay(type: 'success' | 'error', title: string, message: string, navigateTo: string[]): void {
    this.resultType    = type;
    this.resultTitle   = title;
    this.resultMessage = message;
    this.navigateTarget = navigateTo;
    this.showResult    = true;
    setTimeout(() => this.onResultClosed(), 2000); // Auto-close after 2 seconds
  }

  /**
   * Constructs the `Asset` object to be sent to the API from the current form values.
   * - For 'edit' mode, the existing numeric ID is included so the backend updates the correct record.
   * - For 'create' / 'clone', `id` is set to 0, signalling the backend to insert a new row.
   */
  private buildAssetPayload(): Asset {
    const raw = this.assetForm.getRawValue();
    const id  = this.mode === 'edit' ? this.editingAssetNumericId : 0;

    return {
      id,
      assetCode:     raw.assetCode.trim(),
      assetTag:      raw.assetTag.trim(),
      assetDate:     raw.assetDate,
      status:        raw.status,
      serialNumber:  raw.serialNumber.trim(),
      purchaseValue: Number(raw.purchaseValue) || 0,
      warranty:      raw.warranty.trim(),
      notes:         raw.notes.trim(),
      categoryId:    Number(raw.categoryId),
      divisionId:    Number(raw.divisionId),
      productId:     Number(raw.productId),
      supplierId:    Number(raw.supplierId),
    };
  }

  /**
   * Converts an asset date (string ISO or Date object) to the 'YYYY-MM-DD' format
   * required by `<input type="date">`. Falls back to today's date if the value is
   * missing or unparseable.
   */
  private toDateInputValue(value: string | Date | undefined): string {
    if (!value) return this.getTodayDateString();
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return this.getTodayDateString();
    return date.toISOString().slice(0, 10);
  }

  /** Returns today's date as a 'YYYY-MM-DD' string, used as the default for the asset date field. */
  private getTodayDateString(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
