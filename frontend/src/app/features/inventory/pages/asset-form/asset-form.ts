// ─────────────────────────────────────────────────────────────────────────────
// Angular core & common imports
// ─────────────────────────────────────────────────────────────────────────────
import { ChangeDetectorRef, Component, OnInit, inject, ElementRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { AbstractControl, FormBuilder, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
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
import { ProcurementService } from '../../../procurement/services/procurement.service';
import { CheckoutService } from '../../services/checkout.service';

// ─────────────────────────────────────────────────────────────────────────────
// Domain models
// ─────────────────────────────────────────────────────────────────────────────
import { Asset, AssetDetail, AssetStatus } from '../../models/asset.model';
import { Product } from '../../models/product.model';
import { Supplier } from '../../models/supplier.model';
import { Division } from '../../models/division.model';
import { Category } from '../../models/category.model';
import { CheckoutEmployee } from '../../models/checkout.model';
import { PurchasingOrderDto, PurchasingOrderItemDto, PurchasingOrderSummaryDto } from '../../../procurement/models/purchase-order.model';

// ─────────────────────────────────────────────────────────────────────────────
// Shared services & components
// ─────────────────────────────────────────────────────────────────────────────
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-asset-form',
  standalone: true,
  // ReactiveFormsModule is required for [formGroup] and formControlName bindings in the template.
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatIconModule],
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
  private procurementService = inject(ProcurementService);
  private checkoutService = inject(CheckoutService);
  private route = inject(ActivatedRoute);         // Reads route params (e.g., :id) and data (e.g., mode)
  private router = inject(Router);               // Navigates programmatically after save/cancel
  private location = inject(Location);           // Enables browser-native "back" navigation
  private toast = inject(ToastService);          // Shows non-blocking notification toasts
  private hostRef = inject<ElementRef<HTMLElement>>(ElementRef); // Used to focus/scroll to the first invalid field
  private cdr = inject(ChangeDetectorRef);

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
   * True for a brief moment after a rejected submit. Drives the shake animation on invalid
   * fields so a failed save is felt as well as seen.
   */
  shaking = false;

  /**
   * Asset codes already taken, lowercased. Populated from the asset list that is loaded
   * anyway for PO filtering, so uniqueness is checked without an extra request.
   */
  private existingAssetCodes = new Set<string>();

  /**
   * The code this asset already had when editing. Always permitted, otherwise an asset
   * would collide with itself the moment the form is re-saved unchanged.
   */
  private originalAssetCode = '';

  /**
   * Serial numbers already taken, lowercased. Populated the same way as
   * {@link existingAssetCodes} so a duplicate is caught before the API round-trip.
   */
  private existingSerialNumbers = new Set<string>();

  /** The serial number this asset already had when editing. Always permitted, same reasoning as {@link originalAssetCode}. */
  private originalSerialNumber = '';

  /** Human-readable field names, used for both inline errors and the summary toast. */
  private readonly fieldLabels: Record<string, string> = {
    assetCode: 'Asset Code',
    assetTag: 'Asset Tag',
    productId: 'Product',
    status: 'Status',
    assignedUserId: 'Assigned Employee',
    categoryId: 'Category',
    supplierId: 'Supplier',
    divisionId: 'Division',
    serialNumber: 'Serial Number',
    assetDate: 'Asset Date',
    purchaseValue: 'Purchase Value',
    warranty: 'Warranty',
    notes: 'Notes',
  };

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


  // ── Dropdown data ──
  /** All possible asset lifecycle statuses. */
  statuses: AssetStatus[] = ['InUse', 'InStore', 'UnderMaintenance', 'Discarded', 'Transferred', 'Lost'];

  /** Lists populated from the backend on init, bound to <select> dropdowns in the template. */
  products: Product[] = [];
  suppliers: Supplier[] = [];
  divisions: Division[] = [];
  categories: Category[] = [];
  employees: CheckoutEmployee[] = [];

  // ── Purchase Order Auto-Fill State ──
  /** List of all purchasing orders loaded from backend, sorted with latest at top. */
  purchasingOrders: PurchasingOrderSummaryDto[] = [];

  /** Currently selected Purchase Order ID (0 = none selected). */
  selectedPoId = 0;

  /** Full details of selected Purchase Order. */
  currentPo: PurchasingOrderDto | null = null;

  /** Items list from the selected PO (for multi-item POs). */
  poItems: PurchasingOrderItemDto[] = [];

  /** Selected item ID from the PO items list. */
  selectedPoItemId = 0;

  /** Loading indicator while fetching PO details. */
  loadingPoDetails = false;

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
    assetCode:      ['', [Validators.required, Validators.maxLength(50)]],
    assetTag:       ['', [Validators.maxLength(50)]],
    productId:      [0, [Validators.min(1)]],    // 0 = "Select Product" placeholder; min(1) enforces a real selection
    status:         ['InStore' as AssetStatus, [Validators.required]],
    assignedUserId: [0],                        // 0 = Not Assigned (Store Inventory)
    categoryId:     [0, [Validators.min(1)]],
    supplierId:     [0, [Validators.min(1)]],
    divisionId:     [0, [Validators.min(1)]],
    serialNumber:   ['', [Validators.maxLength(100)]],
    assetDate:      [this.getTodayDateString(), [Validators.required]], // Defaults to today's date
    purchaseValue:  [0, [Validators.required, Validators.min(0.01)]], // An asset must be recorded with a real acquisition cost, not zero.
    warranty:       ['', [Validators.maxLength(200)]],
    notes:          ['', [Validators.maxLength(1000)]],
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

    // Registered here rather than in the FormBuilder group so it can close over component
    // state (the loaded code list) that does not exist yet at field-initialisation time.
    this.assetForm.controls.assetCode.addValidators((c) => this.validateAssetCodeUnique(c));
    this.assetForm.controls.serialNumber.addValidators((c) => this.validateSerialNumberUnique(c));

    // Only new registrations are locked to today's date; an existing asset keeps whatever
    // acquisition date it was originally recorded with when edited later.
    if (this.mode === 'create' || this.mode === 'clone') {
      this.assetForm.controls.assetDate.addValidators((c) => this.validateAssetDateIsToday(c));
    }

    this.loadDropdownData();

    if (this.mode === 'create') {
      this.route.queryParams.subscribe((params) => {
        const initialCode = params['code'] || this.generateAssetCode();
        this.assetForm.patchValue({
          assetCode: initialCode,
          warranty: params['warranty'] || '',
          purchaseValue: params['price'] ? Number(params['price']) : 0,
          divisionId: params['divisionId'] ? Number(params['divisionId']) : 0,
          assignedUserId: params['assignedUserId'] ? Number(params['assignedUserId']) : 0,
        });
      });
    } else if (this.assetId) {
      this.assetService.getAssetById(this.assetId).subscribe({
        next: (a) => {
          // Store the numeric ID so it can be included in the update payload later
          this.editingAssetNumericId = Number(a.id) || Number(this.assetId) || 0;

          // Only edit mode keeps the original code; a clone must claim a brand-new one.
          this.originalAssetCode = this.mode === 'edit' ? a.assetCode || '' : '';
          this.originalSerialNumber = this.mode === 'edit' ? a.serialNumber || '' : '';

          // Patch all form fields with values from the fetched asset
          this.assetForm.patchValue({
            assetCode:      a.assetCode || '',
            assetTag:       a.assetTag || '',
            productId:      a.productId || 0,
            status:         a.status || 'InStore',
            assignedUserId: a.assignedUserId || 0,
            categoryId:     a.categoryId || 0,
            supplierId:     a.supplierId || 0,
            divisionId:     a.divisionId || 0,
            serialNumber:   a.serialNumber || '',
            assetDate:      this.toDateInputValue(a.assetDate),  // Normalise to 'YYYY-MM-DD' for <input type="date">
            purchaseValue:  Number(a.purchaseValue) || 0,
            warranty:       a.warranty || '',
            notes:          a.notes || '',
          });

          // For clone mode: reset the ID so a new record is created, and modify the code to signal it's a copy
          if (this.mode === 'clone') {
            this.editingAssetNumericId = 0;
            this.assetForm.patchValue({
              assetCode:      `${a.assetCode}-COPY`,
              serialNumber:   '',  // Serial number must be unique; clear it to prevent duplicates
              assignedUserId: 0,
            });
          }

          // Re-run the uniqueness rules now that the code/serial (and their exempt originals) are known.
          this.assetForm.controls.assetCode.updateValueAndValidity({ emitEvent: false });
          this.assetForm.controls.serialNumber.updateValueAndValidity({ emitEvent: false });
        },
        error: () => {
          this.toast.error('Failed to load asset');
          this.location.back();
        },
      });
    }
  }

  /**
   * Generates a standardized asset code like AST-20260815-1234, retrying until it finds one
   * that is not already taken so the Auto button cannot hand out a colliding code.
   */
  generateAssetCode(): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');

    let code = '';
    for (let attempt = 0; attempt < 20; attempt++) {
      const rand = Math.floor(1000 + Math.random() * 9000);
      code = `AST-${yyyy}${mm}${dd}-${rand}`;
      if (!this.existingAssetCodes.has(code.toLowerCase())) return code;
    }
    return code; // Exhausted the day's random space; the backend still guards uniqueness.
  }

  /** Regenerates a fresh asset code on button click. */
  regenerateCode(): void {
    this.assetForm.patchValue({ assetCode: this.generateAssetCode() });
    this.assetForm.controls.assetCode.updateValueAndValidity({ emitEvent: false });
    this.toast.info('New Asset Code generated');
  }

  preventNegative(event: KeyboardEvent) {
    if (event.key === '-' || event.key === 'e' || event.key === 'E' || event.key === '+') {
      event.preventDefault();
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
   * Today's date as 'YYYY-MM-DD', bound to the Asset Date input's `min`/`max` attributes so its
   * native picker only offers today. Only meaningful in create/clone mode — see {@link restrictDateToToday}.
   */
  get todayDateString(): string {
    return this.getTodayDateString();
  }

  /** True when new-asset registration rules apply, locking the Asset Date field to today. */
  get restrictDateToToday(): boolean {
    return this.mode === 'create' || this.mode === 'clone';
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

  /**
   * Returns the message to show under a field, or '' when the field is fine.
   * Centralised so every field reports its actual problem instead of a generic
   * "is required" that is wrong for range and uniqueness failures.
   */
  errorFor(controlName: keyof typeof this.assetForm.controls): string {
    if (!this.showError(controlName)) return '';

    const control = this.assetForm.controls[controlName];
    const errors = control.errors ?? {};
    const label = this.fieldLabels[controlName] ?? 'This field';

    if (errors['codeTaken']) {
      return `Asset Code "${String(control.value ?? '').trim()}" already exists. Please use a different code.`;
    }
    if (errors['serialTaken']) {
      return `Serial Number "${String(control.value ?? '').trim()}" already exists. Please use a different serial number.`;
    }
    if (errors['notToday']) {
      return 'Asset Date must be today. Past or future dates are not allowed.';
    }
    if (errors['required']) {
      return `${label} is required.`;
    }
    if (errors['maxlength']) {
      return `${label} cannot be longer than ${errors['maxlength'].requiredLength} characters.`;
    }
    if (errors['min']) {
      // purchaseValue uses min(0.01) to reject zero/negative values; the FK dropdowns use min(1),
      // where the failure really means "nothing was picked".
      return controlName === 'purchaseValue'
        ? 'Purchase Value must be greater than zero.'
        : `${label} is required.`;
    }
    return `${label} is not valid.`;
  }

  /** Rejects an asset code that another asset already uses. */
  private validateAssetCodeUnique(control: AbstractControl): ValidationErrors | null {
    const value = String(control.value ?? '').trim().toLowerCase();
    if (!value) return null;
    if (value === this.originalAssetCode.trim().toLowerCase()) return null;
    return this.existingAssetCodes.has(value) ? { codeTaken: true } : null;
  }

  /**
   * Rejects a serial number that another asset already uses. Serial number is optional, so an
   * empty value always passes — only a non-blank duplicate is a problem.
   */
  private validateSerialNumberUnique(control: AbstractControl): ValidationErrors | null {
    const value = String(control.value ?? '').trim().toLowerCase();
    if (!value) return null;
    if (value === this.originalSerialNumber.trim().toLowerCase()) return null;
    return this.existingSerialNumbers.has(value) ? { serialTaken: true } : null;
  }

  /**
   * New asset registrations must be dated today — not backdated, not postdated. Only wired up
   * for create/clone mode; editing an existing asset must not be able to invalidate its
   * original, already-past acquisition date.
   */
  private validateAssetDateIsToday(control: AbstractControl): ValidationErrors | null {
    const value = String(control.value ?? '').trim();
    if (!value) return null;
    return value === this.getTodayDateString() ? null : { notToday: true };
  }

  /** Names of every currently invalid field, for the summary toast. */
  private get invalidFieldLabels(): string[] {
    const names = Object.keys(this.assetForm.controls) as (keyof typeof this.assetForm.controls)[];
    return names
      .filter((name) => this.assetForm.controls[name].invalid)
      .map((name) => this.fieldLabels[name] ?? String(name));
  }

  /**
   * Flags a rejected submit: replays the shake animation on the invalid fields and moves
   * focus to the first one so the user is taken straight to what needs fixing.
   */
  private triggerInvalidFeedback(): void {
    // Cleared first so the animation restarts even on a second consecutive failed submit.
    this.shaking = false;
    setTimeout(() => {
      this.shaking = true;
      setTimeout(() => (this.shaking = false), 600);

      const firstInvalid = this.hostRef.nativeElement.querySelector<HTMLElement>('.field-invalid');
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstInvalid.focus({ preventScroll: true });
      }
    });
  }

  /**
   * Pulls a usable message out of an API error. The API's ExceptionMiddleware serialises
   * PascalCase (`Message`/`Detail`), so camelCase-only lookups silently fell through to
   * "Unknown error occurred". `Message` is checked first because it holds the friendly
   * validation text while `Detail` holds the raw exception.
   */
  private extractApiError(err: HttpErrorResponse): string {
    if (typeof err.error === 'string' && err.error.trim()) return err.error;
    const body = err.error ?? {};
    return (
      body.Message || body.message ||
      body.Detail  || body.detail  ||
      body.Title   || body.title   ||
      'Unknown error occurred'
    );
  }

  /**
   * Shows a failed save. When the backend reports a duplicate asset code or serial number, the
   * error is pushed back onto the offending field so it turns red and shakes like a client-side
   * failure, rather than only appearing in the toast.
   */
  private handleSaveError(err: HttpErrorResponse, action: string): void {
    this.saving = false;
    const detail = this.extractApiError(err);

    if (/already exists/i.test(detail)) {
      const isSerialConflict = /serial number/i.test(detail);
      const control = isSerialConflict ? this.assetForm.controls.serialNumber : this.assetForm.controls.assetCode;
      const value = String(control.value ?? '').trim().toLowerCase();
      if (value) {
        (isSerialConflict ? this.existingSerialNumbers : this.existingAssetCodes).add(value);
      }
      control.updateValueAndValidity({ emitEvent: false });
      control.markAsTouched();
      this.triggerInvalidFeedback();
    }

    this.toast.error(`${action}: ${detail}`);
    this.cdr.detectChanges(); // See the comment in loadDropdownData().
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
      this.triggerInvalidFeedback();

      // Surface the most specific problem first: a duplicate code/serial needs a different
      // message to a blank required field, and the old summary silently omitted Purchase Value.
      const codeTaken = this.assetForm.controls.assetCode.hasError('codeTaken');
      const serialTaken = this.assetForm.controls.serialNumber.hasError('serialTaken');
      const badValue = this.assetForm.controls.purchaseValue.hasError('min');
      const badDate = this.assetForm.controls.assetDate.hasError('notToday');
      const invalid = this.invalidFieldLabels;

      let msg: string;
      if (codeTaken) {
        msg = this.errorFor('assetCode');
      } else if (serialTaken) {
        msg = this.errorFor('serialNumber');
      } else if (badValue) {
        msg = 'Purchase Value must be greater than zero.';
      } else if (badDate) {
        msg = 'Asset Date must be today. Past or future dates are not allowed.';
      } else if (invalid.length > 0) {
        msg = `Please check: ${invalid.join(', ')}`;
      } else {
        msg = 'Please fill all required fields marked with *';
      }

      this.toast.warning(msg);
      return;
    }

    this.saving = true;
    const payload = this.buildAssetPayload();

    if (this.mode === 'clone' || this.mode === 'create') {
      // POST — create a new asset record
      this.assetService.createAsset(payload).subscribe({
        next: () => {
          // If this asset was created from a selected PO, mark the PO as completed/registered
          if (this.selectedPoId && this.selectedPoId > 0) {
            this.procurementService.completeOrder(this.selectedPoId).subscribe({
              next: () => console.log(`[PO] Order #${this.selectedPoId} marked as registered.`),
              error: (err) => console.warn('[PO] Could not update PO status:', err)
            });
          }

          this.saving = false;
          const message = this.mode === 'clone'
            ? `"${payload.assetCode}" has been created as a copy and added to inventory.`
            : `"${payload.assetCode}" has been added to inventory.`;
          this.toast.success(message);
          setTimeout(() => {
            this.router.navigate(['/inventory/assets']);
          }, 1000);
        },
        error: (err: HttpErrorResponse) => this.handleSaveError(err, 'Failed to save'),
      });
    } else {
      // PUT — update the existing asset record
      this.assetService.updateAsset(payload).subscribe({
        next: () => {
          this.saving = false;
          this.toast.success(`"${payload.assetCode}" has been updated.`);
          setTimeout(() => {
            this.router.navigate(['/inventory/assets']);
          }, 1000);
        },
        error: (err: HttpErrorResponse) => this.handleSaveError(err, 'Failed to update'),
      });
    }
  }

  /**
   * Loads all dropdown reference data (products, suppliers, divisions, categories, purchasing orders) in parallel.
   * Uses `forkJoin` so the UI is populated in a single rendering pass.
   * Only unregistered POs are loaded to avoid duplicate asset registrations.
   */
  private loadDropdownData(): void {
    forkJoin({
      products:         this.productService.getAll().pipe(catchError(() => of([] as Product[]))),
      suppliers:        this.supplierService.getAll().pipe(catchError(() => of([] as Supplier[]))),
      divisions:        this.divisionService.getAll().pipe(catchError(() => of([] as Division[]))),
      categories:       this.categoryService.getAll().pipe(catchError(() => of([] as Category[]))),
      purchasingOrders: this.procurementService.getOrders(true).pipe(catchError(() => of([] as PurchasingOrderSummaryDto[]))),
      existingAssets:   this.assetService.getAll().pipe(catchError(() => of([] as AssetDetail[]))),
      employees:        this.checkoutService.getEmployees().pipe(catchError(() => of([] as CheckoutEmployee[]))),
    }).subscribe(({ products, suppliers, divisions, categories, purchasingOrders, existingAssets, employees }) => {
      this.products   = products;
      this.suppliers  = suppliers;
      this.divisions  = divisions;
      this.categories = categories;
      this.employees  = employees || [];

      // Reuse the asset list for client-side asset-code/serial-number uniqueness. The backend
      // validates both authoritatively too; this only gives the user immediate feedback.
      this.existingAssetCodes = new Set(
        (existingAssets || [])
          .map((a) => (a.assetCode || '').trim().toLowerCase())
          .filter(Boolean)
      );
      this.existingSerialNumbers = new Set(
        (existingAssets || [])
          .map((a) => (a.serialNumber || '').trim().toLowerCase())
          .filter(Boolean)
      );
      this.assetForm.controls.assetCode.updateValueAndValidity({ emitEvent: false });
      this.assetForm.controls.serialNumber.updateValueAndValidity({ emitEvent: false });

      // Extract existing asset notes to identify POs that have already been registered
      const existingNotes = (existingAssets || [])
        .map(a => `${a.notes || ''} ${a.assetTag || ''} ${a.orderNumber || ''}`)
        .join(' ');

      // Filter out POs that are already registered or referenced in existing assets
      this.purchasingOrders = (purchasingOrders || [])
        .filter(po => {
          if (po.status === 'Completed' || po.status === 'Registered') return false;
          if (po.orderNumber && existingNotes.includes(po.orderNumber)) return false;
          return true;
        })
        .sort((a, b) => {
          const timeA = a.issuedDate ? new Date(a.issuedDate).getTime() : 0;
          const timeB = b.issuedDate ? new Date(b.issuedDate).getTime() : 0;
          if (timeB !== timeA) return timeB - timeA;
          return (b.id || 0) - (a.id || 0);
        });

      // If in create mode and queryParams had poId, auto select
      if (this.mode === 'create') {
        const queryPoId = Number(this.route.snapshot.queryParams['poId']);
        if (queryPoId && this.purchasingOrders.some(p => p.id === queryPoId)) {
          this.onPoChange(queryPoId);
        }
      }

      // Warn the user if any reference list came back empty
      if (!products.length)   this.toast.error('Failed to load products');
      if (!suppliers.length)  this.toast.error('Failed to load suppliers');
      if (!divisions.length)  this.toast.error('Failed to load divisions');
      if (!categories.length) this.toast.error('Failed to load categories');

      // Without this, the dropdowns above can be left permanently blank: this callback runs
      // once all seven parallel requests have settled, and on this route that resolution
      // sometimes lands in a change-detection pass this view's own tick doesn't pick up,
      // leaving Product/Category/Supplier/Division stuck on their placeholder option even
      // though the arrays above are already populated. Forcing a synchronous check here
      // guarantees the view reflects the data that just arrived.
      this.cdr.detectChanges();
    });
  }

  /**
   * Called when a storekeeper selects an Employee from the optional Assigned Employee dropdown.
   * If an employee is selected, automatically sets status to 'InUse' and populates division.
   */
  onEmployeeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const empId = Number(select.value);
    if (empId > 0) {
      this.assetForm.patchValue({ status: 'InUse' });
      const emp = this.employees.find(e => Number(e.id) === empId);
      if (emp && emp.divisionId && !this.assetForm.value.divisionId) {
        this.assetForm.patchValue({ divisionId: emp.divisionId });
      }
    } else {
      if (this.assetForm.value.status === 'InUse') {
        this.assetForm.patchValue({ status: 'InStore' });
      }
    }
  }

  /**
   * Called when a storekeeper selects a Purchase Order from the dropdown.
   * Fetches the complete PO details and auto-fills supplier, division, date, product, warranty, and price.
   */
  onPoChange(poId: number | string): void {
    const numericId = Number(poId);
    this.selectedPoId = numericId;
    this.poItems = [];
    this.selectedPoItemId = 0;
    this.currentPo = null;

    if (!numericId || numericId <= 0) {
      return;
    }

    this.loadingPoDetails = true;
    this.procurementService.getOrderById(numericId).subscribe({
      next: (po) => {
        this.loadingPoDetails = false;
        this.currentPo = po;
        this.poItems = po.items || [];

        const patchData: any = {};

        // 1. Auto-match Supplier
        if (po.supplierName && this.suppliers.length > 0) {
          const sName = po.supplierName.trim().toLowerCase();
          const supMatch = this.suppliers.find(
            (s) => s.name.trim().toLowerCase() === sName ||
                   sName.includes(s.name.trim().toLowerCase()) ||
                   s.name.trim().toLowerCase().includes(sName)
          );
          if (supMatch) {
            patchData.supplierId = Number(supMatch.id);
          }
        }

        // 2. Auto-match Division
        if (po.divisionId && this.divisions.some(d => Number(d.id) === Number(po.divisionId))) {
          patchData.divisionId = Number(po.divisionId);
        } else if (po.divisionName && this.divisions.length > 0) {
          const dName = po.divisionName.trim().toLowerCase();
          const divMatch = this.divisions.find(
            (d) => d.name.trim().toLowerCase() === dName ||
                   dName.includes(d.name.trim().toLowerCase()) ||
                   d.name.trim().toLowerCase().includes(dName)
          );
          if (divMatch) {
            patchData.divisionId = Number(divMatch.id);
          }
        }

        // Note: Asset Date is intentionally left untouched here — new registrations are
        // locked to today's date, regardless of the PO's (typically earlier) order date.

        // 4. Auto-fill Item details
        if (this.poItems.length > 0) {
          this.selectedPoItemId = this.poItems[0].id;
          this.applyPoItemData(this.poItems[0], po, patchData);
        } else {
          if (po.totalAmount && po.totalAmount > 0) {
            patchData.purchaseValue = Number(po.totalAmount);
          }
          patchData.notes = `PO: #${po.orderNumber}${po.supplierName ? ' - ' + po.supplierName : ''}`;
          this.assetForm.patchValue(patchData);
        }

        this.toast.success(`Auto-filled details from PO #${po.orderNumber}`);
        this.cdr.detectChanges(); // See the comment in loadDropdownData().
      },
      error: () => {
        this.loadingPoDetails = false;
        this.toast.error('Failed to load details for selected PO');
        this.cdr.detectChanges();
      },
    });
  }

  /**
   * Helper to detect category ID based on product/item name, model, and keywords.
   */
  detectCategoryId(itemName: string, modelName: string = ''): number {
    if (!this.categories || this.categories.length === 0) return 0;

    const text = `${itemName || ''} ${modelName || ''}`.toLowerCase();

    // 1. Direct name match
    for (const cat of this.categories) {
      const catNameLower = cat.name.toLowerCase();
      if (text.includes(catNameLower) || catNameLower.includes(text)) {
        return Number(cat.id);
      }
    }

    // 2. Domain keyword matching
    const keywordMap: { match: string; keywords: string[] }[] = [
      {
        match: 'computer',
        keywords: [
          'headphone', 'headset', 'earphone', 'speaker', 'audio', 'sound', 'mic', 'microphone',
          'laptop', 'desktop', 'computer', 'pc', 'monitor', 'screen', 'display', 'keyboard', 'mouse',
          'dell', 'hp', 'lenovo', 'sony', 'asus', 'acer', 'apple', 'macbook', 'samsung',
          'cable', 'adapter', 'charger', 'usb', 'hdmi', 'hard drive', 'ssd', 'hdd', 'ram',
          'server', 'switch', 'router', 'modem', 'v720h', 'wh-', 'mdr'
        ]
      },
      {
        match: 'office',
        keywords: [
          'printer', 'scanner', 'photocopier', 'copier', 'projector', 'fax', 'telephone',
          'phone', 'shredder', 'laminator', 'calculator', 'whiteboard'
        ]
      },
      {
        match: 'furniture',
        keywords: [
          'chair', 'table', 'desk', 'cupboard', 'cabinet', 'shelf', 'shelving', 'rack',
          'stool', 'sofa', 'drawer', 'bench', 'podium', 'curtain', 'blind', 'furniture'
        ]
      },
      {
        match: 'vehicle',
        keywords: [
          'car', 'van', 'truck', 'lorry', 'bike', 'motorcycle', 'vehicle', 'jeep', 'bus', 'scooter'
        ]
      },
      {
        match: 'antenna',
        keywords: [
          'satellite', 'antenna', 'dish', 'receiver', 'transmitter', 'radio', 'transceiver'
        ]
      },
      {
        match: 'lab',
        keywords: [
          'lab', 'microscope', 'oscilloscope', 'spectrometer', 'multimeter', 'sensor',
          'laser', 'pipette', 'centrifuge', 'tester', 'meter'
        ]
      },
      {
        match: 'book',
        keywords: [
          'book', 'journal', 'periodical', 'magazine', 'dictionary', 'handbook'
        ]
      }
    ];

    for (const entry of keywordMap) {
      const targetCat = this.categories.find(c => c.name.toLowerCase().includes(entry.match));
      if (targetCat && entry.keywords.some(kw => text.includes(kw))) {
        return Number(targetCat.id);
      }
    }

    return 0;
  }

  /**
   * Called when the Product selection is changed.
   * Auto-selects category if not already set.
   */
  onProductChange(event: any): void {
    const selectedId = Number(event?.target?.value !== undefined ? event.target.value : event);
    if (!selectedId || selectedId <= 0) return;

    const prod = this.products.find(p => Number(p.id) === selectedId);
    if (prod) {
      const currentCat = Number(this.assetForm.get('categoryId')?.value || 0);
      if (currentCat <= 0) {
        const detectedCatId = this.detectCategoryId(prod.name, prod.modelNumber || '');
        if (detectedCatId > 0) {
          this.assetForm.patchValue({ categoryId: detectedCatId });
        }
      }
    }
  }

  /**
   * Applies the details of a specific PO item to the form (Product, Category, Price, Warranty, Notes).
   */
  applyPoItemData(item: PurchasingOrderItemDto, po: PurchasingOrderDto, existingPatch: any = {}): void {
    const patchData = { ...existingPatch };

    // 1. Match Product
    if (item.itemName && this.products.length > 0) {
      const iName = item.itemName.trim().toLowerCase();
      const mName = (item.model || '').trim().toLowerCase();
      const prodMatch = this.products.find((p) => {
        const pName = p.name.trim().toLowerCase();
        return (
          pName === iName ||
          (mName && pName.includes(mName)) ||
          pName.includes(iName) ||
          iName.includes(pName)
        );
      });
      if (prodMatch) {
        patchData.productId = Number(prodMatch.id);
      }
    }

    // 2. Auto-detect Category
    const detectedCatId = this.detectCategoryId(item.itemName, item.model || '');
    if (detectedCatId > 0) {
      patchData.categoryId = detectedCatId;
    }

    // 3. Purchase Value (discounted price or unit price or total price)
    const price = item.discountedPrice || item.unitPrice || item.totalPrice || 0;
    if (price > 0) {
      patchData.purchaseValue = Number(price);
    } else if (po.totalAmount && po.totalAmount > 0) {
      patchData.purchaseValue = Number(po.totalAmount);
    }

    // 4. Warranty
    if (item.warranty) {
      patchData.warranty = item.warranty;
    }

    // 5. Notes
    const noteParts = [
      `PO: #${po.orderNumber}`,
      item.itemName ? `Item: ${item.itemName}` : '',
      item.model ? `Model: ${item.model}` : '',
      item.specialNote ? `Note: ${item.specialNote}` : '',
    ].filter(Boolean);
    patchData.notes = noteParts.join(' | ');

    this.assetForm.patchValue(patchData);
  }

  /**
   * Triggered when storekeeper chooses a different item in multi-item PO.
   */
  onPoItemChange(itemId: number | string): void {
    const numericId = Number(itemId);
    this.selectedPoItemId = numericId;
    const item = this.poItems.find((i) => i.id === numericId);
    if (item && this.currentPo) {
      this.applyPoItemData(item, this.currentPo);
      this.toast.info(`Updated form with item: ${item.itemName}`);
    }
  }

  /** Navigates back to the previous page without saving. */
  onCancel(): void {
    this.location.back();
  }

  /**
   * Constructs the `Asset` object to be sent to the API from the current form values.
   * - For 'edit' mode, the existing numeric ID is included so the backend updates the correct record.
   * - For 'create' / 'clone', `id` is set to 0, signalling the backend to insert a new row.
   */
  private buildAssetPayload(): Asset {
    const raw = this.assetForm.getRawValue();
    const id  = this.mode === 'edit' ? this.editingAssetNumericId : 0;
    const assignedUserId = Number(raw.assignedUserId) > 0 ? Number(raw.assignedUserId) : undefined;

    return {
      id,
      assetCode:      raw.assetCode.trim(),
      assetTag:       raw.assetTag.trim(),
      assetDate:      raw.assetDate,
      status:         raw.status,
      serialNumber:   raw.serialNumber.trim(),
      purchaseValue:  Number(raw.purchaseValue) || 0,
      warranty:       raw.warranty.trim(),
      notes:          raw.notes.trim(),
      categoryId:     Number(raw.categoryId),
      divisionId:     Number(raw.divisionId),
      productId:      Number(raw.productId),
      supplierId:     Number(raw.supplierId),
      assignedUserId: assignedUserId,
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
    return this.toLocalDateString(date);
  }

  /**
   * Returns today's date as a 'YYYY-MM-DD' string, used both as the default for the asset date
   * field and to enforce the "must be today" rule on new registrations.
   */
  private getTodayDateString(): string {
    return this.toLocalDateString(new Date());
  }

  /**
   * Formats a Date using its local calendar day, not `toISOString()`'s UTC day — which would be
   * off by one for part of the day in any timezone west of UTC, wrongly rejecting "today" as the
   * asset date validator started strictly comparing against this exact string.
   */
  private toLocalDateString(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
