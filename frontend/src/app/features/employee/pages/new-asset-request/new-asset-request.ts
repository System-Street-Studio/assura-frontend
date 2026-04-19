import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssetService } from '../../services/asset-request.service';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../core/auth/auth.service';
import { CategoryService } from '../../../inventory/services/category.service';
import { Category } from '../../../inventory/models/category.model';


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

  categories = signal<Category[]>([]);
  selectedFiles = signal<File[]>([]);
  isSubmitting = signal(false);
  fileInput: HTMLInputElement | null = null;

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

  ngOnInit(): void {
    this.categoryService.getAll().subscribe({
      next: (cats) => this.categories.set(cats),
      error: (err) => console.error('Failed to load categories', err)
    });
  }

  onSubmit() {
    this.isSubmitting.set(true);
    this.assetService.createRequest(this.requestData).subscribe({
      next: (res: any) => {
        this.isSubmitting.set(false);
        alert(res.message || 'Request submitted successfully!');
        this.location.back();
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        console.error('Save failed', err);
        alert('Error submitting request. Please try again.');
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
      // Reset input
      if (this.fileInput) this.fileInput.value = '';
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