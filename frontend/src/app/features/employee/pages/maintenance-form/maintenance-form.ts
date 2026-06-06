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

<<<<<<< HEAD
    // Map priority string to PriorityType enum value
    const priorityMap: Record<string, number> = { Low: 1, Normal: 2, Medium: 3, High: 4, Urgent: 5 };

    const payload = {
      type: 4,   // RequestType.Maintenance
      priority: priorityMap[this.priority()] ?? 2,
      description: `Maintenance Request - Issue: ${this.issueType()}. ${this.description()}`.trim(),
      assetId: this.selectedAssetId() ?? undefined
    };

    this.assetRequestService.createUnifiedRequest(payload).subscribe({
=======
    const requestPayload = {
      employeeId: this.authService.getUserId() || '',
      submittedBy: this.authService.getUserName() || 'Employee',
      assetCategory: 'N/A',
      assetName: this.asset(),
      description: this.description(),
      reason: `Issue: ${this.issueType()}`,
      quantity: 1,
      priority: this.priority(),
      requestType: 'Maintenance',
      submittedDate: new Date().toISOString()
    };

    this.assetRequestService.createRequest(requestPayload, this.selectedFiles()).subscribe({
>>>>>>> feature/division-head-part
      next: () => {
        this.isSubmitting.set(false);
        alert('Maintenance Request Submitted Successfully!');
        this.location.back();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error('Save failed', err);
        console.error('Error status:', err.status);
        console.error('Error response:', err.error);
        const errorMsg = err.error?.message || err.error?.errors || err.statusText || 'Unknown error';
        alert(`Error submitting request:\n${JSON.stringify(errorMsg)}`);
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