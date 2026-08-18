import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AssetService as AssetRequestService } from '../../services/asset-request.service';
import { AssetService } from '../../../inventory/services/asset.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { AssetDetail } from '../../../inventory/models/asset.model';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-maintenance-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './maintenance-form.html',
  styleUrls: ['./maintenance-form.css']
})
export class MaintenanceFormComponent implements OnInit {
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
  issueType = signal('Damaged');
  description = signal('');
  priority = signal('Normal');
  selectedFiles = signal<File[]>([]);
  isSubmitting = signal(false);

  // Load assigned assets on init
  ngOnInit(): void {
    this.assetService.getAll().subscribe({
      next: (assets) => {
        this.assignedAssets.set(assets);

        // Auto-select asset from route state
        const passedAssetName = this.route.snapshot.data['assetName'] || window.history.state?.assetName;
        if (passedAssetName) {
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
    if (!this.asset() || !this.issueType() || !this.priority()) {
      alert('Failed to create maintenance request. Please fill all required fields.');
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
      priority: this.priority(),
      requestType: 'Maintenance',
      reason: this.issueType(),
      description: `Maintenance Request for ${this.asset()}: ${this.description()}`,
      quantity: 1,
      assetId: this.selectedAssetId()
    };

    // Call service to create request with attachments
    this.assetRequestService.createRequest(requestData, this.selectedFiles()).subscribe({
      next: (res: any) => {
        this.isSubmitting.set(false);
        this.toastService.success(res?.message || 'Maintenance Request Submitted Successfully!');
        setTimeout(() => {
          this.location.back();
        }, 1000);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error('Save failed', err);
        this.toastService.error(err?.error?.message || 'Error submitting request. Please try again.');
      }
    });
  }

  // Cancel button logic
  onCancel() {
    this.location.back();
  }

// File attachment logic
  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files) as File[];
      this.selectedFiles.update(prev => [...prev, ...newFiles]);
    }
  }

  // Remove selected file
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