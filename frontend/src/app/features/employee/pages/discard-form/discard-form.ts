import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { AssetService as AssetRequestService } from '../../services/asset-request.service';
import { AssetService } from '../../../inventory/services/asset.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { AssetDetail } from '../../../inventory/models/asset.model';

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

  // Form Signals
  assignedAssets = signal<AssetDetail[]>([]);
  asset = signal('');
  reason = signal('');
  selectedFiles = signal<File[]>([]);
  isSubmitting = signal(false);

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
          }
        }
      },
      error: (err) => console.error('Failed to load assigned assets', err)
    });
  }

  // Submit logic
  onSubmit() {
    this.isSubmitting.set(true);

    const payload = {
      type: 5,   // RequestType.Disposal
      priority: 2, // PriorityType.Normal
      description: `Discard Request - Asset: ${this.asset()}. Reason: ${this.reason()}`.trim(),
    };

    this.assetRequestService.createUnifiedRequest(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        alert('Discard Request Submitted Successfully!');
        this.location.back();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error('Save failed', err);
        alert('Error submitting request. Please try again.');
      }
    });
  }

  // Cancel button logic 
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
