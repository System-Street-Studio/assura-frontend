import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AssetService as AssetRequestService } from '../../services/asset-request.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { CategoryService } from '../../../inventory/services/category.service';
import { Category } from '../../../inventory/models/category.model';

@Component({
  selector: 'app-transfer-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './transfer-form.html',
  styleUrl: './transfer-form.css',
})
export class TransferFormComponent implements OnInit {
    // Signals
    categories = signal<Category[]>([]);
    assetName = signal('');
    category = signal('');
    description = signal('');
    quantity = signal(1);
    priority = signal('Normal');
    reason = signal('');
    fromDate = signal<Date | null>(null);
    toDate = signal<Date | null>(null);
    selectedFiles = signal<File[]>([]);
    isSubmitting = signal(false);

    ngOnInit(): void {
      this.categoryService.getAll().subscribe({
        next: (cats) => this.categories.set(cats),
        error: (err) => console.error('Failed to load categories', err)
      });
    }
  private location = inject(Location);
  private assetRequestService = inject(AssetRequestService);
  private categoryService = inject(CategoryService);
  private authService = inject(AuthService);

  onSubmit() {
    if (!this.assetName() || !this.category() || !this.reason()) {
      alert('Failed to create transfer request. Please fill all required fields.');
      return;
    }
    this.isSubmitting.set(true);
    const requestPayload = {
      employeeId: this.authService.getUserId() || '',
      submittedBy: this.authService.getUserName() || 'Employee',
      assetCategory: this.category(),
      assetName: this.assetName(),
      description: this.description(),
      reason: `${this.reason()} (Transfer periods: ${this.fromDate()?.toLocaleDateString()} to ${this.toDate()?.toLocaleDateString()})`,
      quantity: this.quantity(),
      priority: this.priority(),
      requestType: 'Transfer',
      submittedDate: new Date().toISOString()
    };

    this.assetRequestService.createRequest(requestPayload, this.selectedFiles()).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        alert('Transfer Request Submitted Successfully!');
        this.location.back();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error('Submission failed', err);
        alert('Failed to submit request. Please try again.');
      }
    });
  }

  onCancel() {
    this.location.back();
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files) as File[];
      this.selectedFiles.update(prev => [...prev, ...newFiles]);
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.update(files => {
      const updated = [...files];
      updated.splice(index, 1);
      return updated;
    });
  }

  browseFiles(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.addEventListener('change', (e) => this.onFileSelected(e));
    input.click();
  }
}
