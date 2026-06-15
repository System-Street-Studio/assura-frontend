import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AssetService as AssetRequestService } from '../../services/asset-request.service';
import { AssetService } from '../../../inventory/services/asset.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { AssetDetail } from '../../../inventory/models/asset.model';

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

  // Form Signals
  assignedAssets = signal<AssetDetail[]>([]);
  asset = signal('');
  selectedAssetId = signal<number | null>(null);
  issueType = signal('Damaged');
  description = signal('');
  priority = signal('Normal');
  selectedFiles = signal<File[]>([]);
  isSubmitting = signal(false);

  ngOnInit(): void {
    this.assetService.getAll().subscribe({
      next: (assets) => {
        this.assignedAssets.set(assets);

        // Auto-select asset from route state
        const passedAssetName = this.route.snapshot.data['assetName'] || window.history.state.assetName;
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

  // Submit logic
  onSubmit() {
    // Validate required fields
    if (!this.asset() || !this.issueType() || !this.priority()) {
      alert('Failed to create maintenance request. Please fill all required fields.');
      return;
    }
    this.isSubmitting.set(true);

    const formData = new FormData();
    const userId = this.authService.getUserId();
    const userName = this.authService.getUserName();

    formData.append('employeeId', userId ? userId.toString() : '');
    formData.append('submittedBy', userName || '');
    formData.append('assetName', this.asset());
    formData.append('assetCategory', 'General');
    formData.append('priority', this.priority());
    formData.append('requestType', 'Maintenance');
    formData.append('reason', this.issueType());
    formData.append('description', `Maintenance Request for ${this.asset()}: ${this.description()}`);
    formData.append('quantity', '1');

    this.assetRequestService.createRequest(formData, this.selectedFiles()).subscribe({
      next: (res: any) => {
        this.isSubmitting.set(false);
        alert(res?.message || 'Maintenance Request Submitted Successfully!');
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