import { CommonModule, Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ProductService } from '../../services/product.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { ProductUpdateRequest } from '../../models/product.model';
import { ResultOverlayComponent } from '../../../../shared/components/result-overlay/result-overlay';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, ResultOverlayComponent],
  templateUrl: './product-form.html',
  styleUrls: ['./product-form.css'],
})
export class ProductFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  mode: 'create' | 'edit' = 'create';
  loading = false;
  submitting = false;
  submitted = false;
  productId = 0;

  imageFile: File | null = null;
  imagePreviewUrl: string | null = null;

  /* Result overlay — shown for a freshly created product, matching the check-in flow's
     success card. Edits keep the plain toast; only a brand-new record gets the celebratory
     confirmation before returning to the list. */
  showResult = false;
  resultType: 'success' | 'error' = 'success';
  resultTitle = '';
  resultMessage = '';
  private resultAutoCloseTimer: ReturnType<typeof setTimeout> | null = null;

  productForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    manufacturer: ['', [Validators.required, Validators.maxLength(120)]],
    modelNumber: ['', [Validators.maxLength(120)]],
    description: ['', [Validators.maxLength(500)]],
  });

  ngOnInit(): void {
    this.mode = this.route.snapshot.data['mode'] || 'create';
    const rawId = this.route.snapshot.paramMap.get('id');

    if (this.mode === 'edit') {
      if (!rawId || Number.isNaN(Number(rawId))) {
        this.toast.error('Invalid product selected for editing.');
        this.router.navigate(['/inventory/products']);
        return;
      }

      this.productId = Number(rawId);
      this.loading = true;

      this.productService.getById(this.productId).subscribe({
        next: (product) => {
          this.productForm.patchValue({
            name: product.name || '',
            manufacturer: product.manufacturer || '',
            modelNumber: product.modelNumber || '',
            description: product.description || '',
          });
          this.imagePreviewUrl = product.imageUrl || null;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.loading = false;
          this.toast.error('Failed to load product details.');
          this.router.navigate(['/inventory/products']);
        },
      });
    }
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      this.toast.warning('Only JPG, PNG, WEBP or GIF images are allowed.');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      this.toast.warning('Image must be 5MB or smaller.');
      return;
    }

    if (this.imagePreviewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(this.imagePreviewUrl);
    }
    this.imageFile = file;
    this.imagePreviewUrl = URL.createObjectURL(file);
  }

  removeImage(): void {
    if (this.imagePreviewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(this.imagePreviewUrl);
    }
    this.imageFile = null;
    this.imagePreviewUrl = null;
  }

  get pageTitle(): string {
    return this.mode === 'edit' ? 'Edit Product' : 'New Product';
  }

  get submitLabel(): string {
    if (this.submitting) return 'Saving...';
    return this.mode === 'edit' ? 'Save Changes' : 'Create Product';
  }

  get isInvalid(): boolean {
    return this.productForm.invalid;
  }

  showError(controlName: keyof typeof this.productForm.controls): boolean {
    const control = this.productForm.controls[controlName];
    return control.invalid && (control.touched || this.submitted);
  }

  onCancel(): void {
    this.location.back();
  }

  onSave(): void {
    this.submitted = true;
    this.productForm.controls.name.setValue(this.productForm.controls.name.value.trim());
    this.productForm.controls.manufacturer.setValue(this.productForm.controls.manufacturer.value.trim());

    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.toast.warning('Please fill all required fields marked with *.');
      return;
    }

    this.submitting = true;
    const raw = this.productForm.getRawValue();
    const payload = {
      name: raw.name.trim(),
      manufacturer: raw.manufacturer.trim(),
      modelNumber: raw.modelNumber.trim() || undefined,
      description: raw.description.trim() || undefined,
    };

    if (this.mode === 'edit') {
      const updatePayload: ProductUpdateRequest = {
        id: this.productId,
        ...payload,
      };

      this.productService.update(updatePayload).subscribe({
        next: () => this.finishSave(this.productId, raw.name.trim()),
        error: (err: HttpErrorResponse) => {
          this.submitting = false;
          const detail = err.error?.detail || err.error?.message || err.error?.title || 'Unknown error occurred';
          this.toast.error(`Failed to update product: ${detail}`);
        },
      });
      return;
    }

    this.productService.create(payload).subscribe({
      next: (created) => this.finishSave(Number(created.id), raw.name.trim()),
      error: (err: HttpErrorResponse) => {
        this.submitting = false;
        const detail = err.error?.detail || err.error?.message || err.error?.title || 'Unknown error occurred';
        this.toast.error(`Failed to create product: ${detail}`);
      },
    });
  }

  /**
   * Uploads the staged image (if any) against the just-created/updated product, then hands off
   * to {@link onSaveComplete}. Deliberately leaves `submitting` at `true` on every path here —
   * the form is either about to be replaced by the success overlay or navigated away from
   * regardless, and flipping it back to `false` beforehand only races the submit button's
   * [disabled] binding against Angular's dev-mode change-detection re-check (NG0100) for no
   * visible benefit.
   */
  private finishSave(id: number, name: string): void {
    if (!this.imageFile) {
      this.onSaveComplete(name);
      return;
    }

    this.productService.uploadImage(id, this.imageFile).subscribe({
      next: () => this.onSaveComplete(name),
      error: () => {
        this.toast.warning('Product saved, but the image failed to upload.');
        this.router.navigate(['/inventory/products']);
      },
    });
  }

  /**
   * A fresh product gets the same celebratory success card as check-in/check-out, auto-closing
   * after 2 seconds before returning to the list. An edit keeps the plain toast — it isn't a new
   * record worth a full-screen confirmation.
   */
  private onSaveComplete(name: string): void {
    if (this.mode === 'edit') {
      this.toast.success('Product updated successfully');
      this.router.navigate(['/inventory/products']);
      return;
    }

    this.resultType = 'success';
    this.resultTitle = 'Product Created!';
    this.resultMessage = `"${name}" has been added to the product catalog.`;
    this.showResult = true;

    if (this.resultAutoCloseTimer) {
      clearTimeout(this.resultAutoCloseTimer);
    }
    this.resultAutoCloseTimer = setTimeout(() => this.onResultClosed(), 2000);
    this.cdr.detectChanges();
  }

  /** Fired both by the overlay's own close button and by the 2-second auto-close timer. */
  onResultClosed(): void {
    if (this.resultAutoCloseTimer) {
      clearTimeout(this.resultAutoCloseTimer);
      this.resultAutoCloseTimer = null;
    }
    this.showResult = false;
    this.router.navigate(['/inventory/products']);
  }

  ngOnDestroy(): void {
    if (this.resultAutoCloseTimer) {
      clearTimeout(this.resultAutoCloseTimer);
      this.resultAutoCloseTimer = null;
    }
  }
}
