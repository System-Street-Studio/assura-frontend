import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { AssetService as AssetRequestService } from '../../services/asset-request.service';
import { AssetService } from '../../../inventory/services/asset.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { AssetDetail } from '../../../inventory/models/asset.model';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-discard-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './discard-form.html',
  styleUrl: './discard-form.css',
})
export class DiscardFormComponent implements OnInit {
  private location = inject(Location);
  private assetRequestService = inject(AssetRequestService);
  private assetService = inject(AssetService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);

  // Form Signals
  assignedAssets = signal<AssetDetail[]>([]);
  asset = signal('');
  selectedAssetId = signal<number | null>(null);
  reason = signal('');
  selectedFiles = signal<File[]>([]);
  isSubmitting = signal(false);
  resultVisible = signal(false);
  result = signal<'success' | 'error' | null>(null);

  showResult(): boolean {
    return this.resultVisible();
  }

  resultType(): 'success' | 'error' | null {
    return this.result();
  }

  onResultClosed(): void {
    this.resultVisible.set(false);
    this.location.back();
  }

  // Load assigned assets on init
  ngOnInit(): void {
    this.assetService.getAll(true).subscribe({
      next: (assets) => {
        this.assignedAssets.set(assets);

        // Auto-select asset from route state
        const passedAssetName = this.route.snapshot.data['assetName'] || window.history.state?.assetName;
        if (passedAssetName) {
          // Find the matching asset and set it with full format
          const matchedAsset = assets.find(a => a.productName === passedAssetName);
          if (matchedAsset) {
            this.asset.set(matchedAsset.productName + ' (' + matchedAsset.assetCode + ')');
            this.selectedAssetId.set(Number(matchedAsset.id));
          }
        }
      },
      error: (err) => console.error('Failed to load assigned assets', err)
    });
  }

  onAssetSelected(selectedValue: string) {
    this.asset.set(selectedValue);
    if (!selectedValue) {
      this.selectedAssetId.set(null);
      return;
    }
    const matchedAsset = this.assignedAssets().find(
      a => (a.productName + ' (' + a.assetCode + ')') === selectedValue
    );
    if (matchedAsset) {
      this.selectedAssetId.set(Number(matchedAsset.id));
    } else {
      this.selectedAssetId.set(null);
    }
  }

  // Submit logic
  onSubmit() {
    // Validate required fields
    if (!this.asset()) {
      alert('Failed to create discard request. Please fill all required fields.');
      return;
    }
    this.isSubmitting.set(true);

    const userId = this.authService.getUserId();
    const userName = this.authService.getUserName();

    const requestData = {
      employeeId: userId ? userId.toString() : '',
      submittedBy: userName || '',
      assetName: this.asset(),
      assetCategory: 'General',
      priority: 'Normal',
      requestType: 'Discard',
      reason: this.reason(),
      description: `Discard Request for ${this.asset()}`,
      quantity: 1,
      assetId: this.selectedAssetId()
    };

    // Call the service to create the discard request
    this.assetRequestService.createRequest(requestData, this.selectedFiles()).subscribe({
      next: (res: any) => {
        this.isSubmitting.set(false);
        this.resultVisible.set(true);
        this.result.set('success');
        this.toastService.success(res?.message || 'Discard request submitted successfully');
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.resultVisible.set(true);
        this.result.set('error');
        console.error('Save failed', err);
        this.toastService.error('Error submitting request. Please try again.');
      }
    });
  }

  // Cancel button logic
  onCancel() {
    this.location.back();
  }

  // Method to handle file selection
  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files) as File[];
      this.selectedFiles.update(prev => [...prev, ...newFiles]);
    }
  }

  // Method to remove a selected file 
  removeFile(index: number): void {
    this.selectedFiles.update(files => {
      const updated = [...files];
      updated.splice(index, 1);
      return updated;
    });
  }

  // Method to browse and select files 
  browseFiles(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.addEventListener('change', (e) => this.onFileSelected(e));
    input.click();
  }
}
