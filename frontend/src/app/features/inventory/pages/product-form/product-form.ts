import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ProductService } from '../../services/product.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { ProductUpdateRequest } from '../../models/product.model';

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

  mode: 'create' | 'edit' = 'create';
  loading = false;
  submitting = false;
  submitted = false;
  productId = 0;

  productForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    manufacturer: ['', [Validators.maxLength(120)]],
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
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.toast.error('Failed to load product details.');
          this.router.navigate(['/inventory/products']);
        },
      });
    }
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

    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.toast.warning('Please fill the required product name.');
      return;
    }

    this.submitting = true;
    const raw = this.productForm.getRawValue();
    const payload = {
      name: raw.name.trim(),
      manufacturer: raw.manufacturer.trim() || undefined,
      modelNumber: raw.modelNumber.trim() || undefined,
      description: raw.description.trim() || undefined,
    };

    if (this.mode === 'edit') {
      const updatePayload: ProductUpdateRequest = {
        id: this.productId,
        ...payload,
      };

      this.productService.update(updatePayload).subscribe({
        next: () => {
          this.submitting = false;
          this.toast.success('Product updated successfully');
          this.router.navigate(['/inventory/products']);
        },
        error: (err: HttpErrorResponse) => {
          this.submitting = false;
          const detail = err.error?.detail || err.error?.message || err.error?.title || 'Unknown error occurred';
          this.toast.error(`Failed to update product: ${detail}`);
        },
      });
      return;
    }

    this.productService.create(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.toast.success('Product created successfully');
        this.router.navigate(['/inventory/products']);
      },
      error: (err: HttpErrorResponse) => {
        this.submitting = false;
        const detail = err.error?.detail || err.error?.message || err.error?.title || 'Unknown error occurred';
        this.toast.error(`Failed to create product: ${detail}`);
      },
    });
  }
}
