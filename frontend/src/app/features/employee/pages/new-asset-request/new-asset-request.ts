import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssetService } from '../../services/asset-request.service';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../core/auth/auth.service';
import { CategoryService } from '../../../inventory/services/category.service';
import { Category } from '../../../inventory/models/category.model';
import { ToastService } from '../../../../shared/services/toast.service';


@Component({
  selector: 'app-new-asset-request',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule],
  templateUrl: './new-asset-request.html',
  styleUrl: './new-asset-request.css',
})
export class NewAssetRequestComponent implements OnInit {
  private authService = inject(AuthService);
  private categoryService = inject(CategoryService);
  private location = inject(Location);
  private toastService = inject(ToastService);

  categories = signal<Category[]>([]);
  selectedFiles = signal<File[]>([]);
  isSubmitting = signal(false);
  fileInput: HTMLInputElement | null = null;

  // Form data model
  requestData = {
    id: 0,
    employeeId: this.authService.getUserId() || '',
    assetCategory: '',
    assetName: '',
    description: '',
    quantity: 1,
    priority: 'Normal',
    reason: '',
    status: 'Pending',
    requestType: 'New Asset',
    submittedDate: new Date(),
    submittedBy: this.authService.getUserName() || 'Employee'
  };

  constructor(private router: Router, private assetService: AssetService) { }

  // Load categories on init
  ngOnInit(): void {
    this.categoryService.getAll().subscribe({
      next: (cats) => this.categories.set(cats),
      error: (err) => console.error('Failed to load categories', err)
    });
  }


  preventNegativeInput(event: KeyboardEvent) {
    if (event.key === '-' || event.key === 'e' || event.key === 'E' || event.key === '+') {
      event.preventDefault();
    }
  }

  onQuantityChange(value: any) {
    const num = Number(value);
    if (isNaN(num) || num < 1) {
      this.requestData.quantity = 1;
    } else {
      this.requestData.quantity = Math.floor(num);
    }
  }

  // Handle form submission
  onSubmit(): void {
    if (!this.requestData.quantity || this.requestData.quantity < 1) {
      this.requestData.quantity = 1;
    }
    this.isSubmitting.set(true);

    const requestPayload = {
      employeeId: this.requestData.employeeId,
      assetCategory: this.requestData.assetCategory,
      assetName: this.requestData.assetName,
      description: this.requestData.description,
      quantity: this.requestData.quantity,
      priority: this.requestData.priority,
      reason: this.requestData.reason,
      requestType: this.requestData.requestType,
      submittedBy: this.requestData.submittedBy,
      submittedDate: this.requestData.submittedDate
    };

    // Call service to create request with attachments
    this.assetService.createRequest(requestPayload, this.selectedFiles()).subscribe({
      next: (res: any) => {
        this.isSubmitting.set(false);
        this.toastService.success(res?.message || 'Asset request submitted successfully');
        setTimeout(() => {
          this.location.back();
        }, 1000);
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        console.error('Save failed', err);
        this.toastService.error(err?.error?.message || 'Error submitting request. Please try again.');
      }
    });
  }

  // Handle cancel action
  onCancel() {
    this.location.back();
  }

  // Handle file selection
  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files) as File[];
      this.selectedFiles.update(prev => [...prev, ...newFiles]);
      // Reset input
      if (this.fileInput) this.fileInput.value = '';
    }
  }

  // Remove file from selection
  removeFile(index: number): void {
    this.selectedFiles.update(files => {
      const updated = [...files];
      updated.splice(index, 1);
      return updated;
    });
  }

  // Trigger file input click
  browseFiles(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.addEventListener('change', (e) => this.onFileSelected(e));
    input.click();
  }
}