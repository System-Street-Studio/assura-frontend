import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { AssetService as AssetRequestService } from '../../services/asset-request.service';
import { AssetService } from '../../../inventory/services/asset.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { AssetDetail } from '../../../inventory/models/asset.model';
import { ResultOverlayComponent } from '../../../../shared/components/result-overlay/result-overlay';

@Component({
  selector: 'app-discard-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule,ResultOverlayComponent],
  templateUrl: './discard-form.html',
  styleUrl: './discard-form.css',
})
export class DiscardFormComponent implements OnInit {
  private location = inject(Location);
  private assetRequestService = inject(AssetRequestService);
  private assetService = inject(AssetService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  // Result Signals
  showResult = signal(false);
  resultType = signal<'success' | 'error'>('success');
  resultTitle = signal('');
  resultMessage = signal('');

  // Form Signals
  assignedAssets = signal<AssetDetail[]>([]);
  asset = signal('');
  selectedAssetId = signal<number | null>(null);
  reason = signal('');
  selectedFiles = signal<File[]>([]);
  isSubmitting = signal(false);

  // Load assigned assets on init
  ngOnInit(): void {
    this.assetService.getAll().subscribe({
      next: (assets) => {
        this.assignedAssets.set(assets);

        // Auto-select asset from route state
        const passedAssetName = this.route.snapshot.data['assetName'] || window.history.state.assetName;
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
        this.resultType.set('success');
        this.resultTitle.set('Success');
        this.resultMessage.set(res?.message || 'Discard Request Submitted Successfully!');
        this.showResult.set(true);
        this.location.back();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error('Save failed', err);
        this.resultType.set('error');
        this.resultTitle.set('Error');
        this.resultMessage.set('Error submitting request. Please try again.');
        this.showResult.set(true);
      }
    });
  }

  // Cancel button logic 
  onCancel() {
    this.location.back();
  }

  // Handle result overlay close
  onResultClosed(): void {
  this.showResult.set(false);

  if (this.resultType() === 'success') {
    this.location.back();
  }
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
