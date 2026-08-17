import { CommonModule, Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ProductService } from '../../services/product.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { ProductUpdateRequest } from '../../models/product.model';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './product-form.html',
  styleUrls: ['./product-form.css'],
})
export class ProductFormComponent implements OnInit {
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
        next: () => this.finishSave(this.productId, 'Product updated successfully'),
        error: (err: HttpErrorResponse) => {
          this.submitting = false;
          const detail = err.error?.detail || err.error?.message || err.error?.title || 'Unknown error occurred';
          this.toast.error(`Failed to update product: ${detail}`);
        },
      });
      return;
    }

    this.productService.create(payload).subscribe({
      next: (created) => this.finishSave(Number(created.id), 'Product created successfully'),
      error: (err: HttpErrorResponse) => {
        this.submitting = false;
        const detail = err.error?.detail || err.error?.message || err.error?.title || 'Unknown error occurred';
        this.toast.error(`Failed to create product: ${detail}`);
      },
    });
  }

  /**
   * Uploads the staged image (if any) against the just-created/updated product, then navigates
   * away. Deliberately leaves `submitting` at `true` on every path here — the component is about
   * to be destroyed by the navigation regardless, and flipping it back to `false` immediately
   * beforehand only races the submit button's [disabled] binding against Angular's dev-mode
   * change-detection re-check (NG0100) for no visible benefit.
   */
  private finishSave(id: number, successMessage: string): void {
    if (!this.imageFile) {
      this.toast.success(successMessage);
      this.router.navigate(['/inventory/products']);
      return;
    }

    this.productService.uploadImage(id, this.imageFile).subscribe({
      next: () => {
        this.toast.success(successMessage);
        this.router.navigate(['/inventory/products']);
      },
      error: () => {
        this.toast.warning(`${successMessage}, but the image failed to upload.`);
        this.router.navigate(['/inventory/products']);
      },
    });
  }
}
