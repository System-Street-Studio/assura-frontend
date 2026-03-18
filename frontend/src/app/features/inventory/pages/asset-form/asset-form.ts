import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AssetService } from '../../services/asset.service';
import { AssetDetail, AssetStatus } from '../../models/asset.model';
import { ToastService } from '../../../../shared/services/toast.service';
import { ResultOverlayComponent } from '../../../../shared/components/result-overlay/result-overlay';

@Component({
  selector: 'app-asset-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, ResultOverlayComponent],
  templateUrl: './asset-form.html',
  styleUrls: ['./asset-form.css'],
})
export class AssetFormComponent implements OnInit {
  private assetService = inject(AssetService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private toast = inject(ToastService);

  mode: 'edit' | 'clone' | 'create' = 'edit';
  assetId = '';
  saving = false;
  submitted = false;
  imagePreview: string | null = null;

  showResult = false;
  resultType: 'success' | 'error' = 'success';
  resultTitle = '';
  resultMessage = '';
  private navigateTarget: string[] = [];

  statuses: AssetStatus[] = ['Available', 'Deployed', 'In Repair', 'Retired'];
  products = ['XPS 13"', 'ThinkPad E15 G4', 'iPhone 15 Pro Max', 'Yoga 7', 'MacBook Pro 14"', 'Surface Pro 9'];
  suppliers = ['Dell', 'Apple', 'Lenovo', 'HP', 'Microsoft', 'Samsung'];
  locations = ['Building A - 3rd Floor', 'Building B - 1st Floor', 'Warehouse 1', 'Remote Storage'];
  departments = ['IT', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
  categories = ['Laptops', 'Phones', 'Tablets', 'Monitors', 'Accessories', 'Networking'];
  auditSchedules = ['Monthly', 'Quarterly', 'Semi-Annually', 'Annually'];

  form: AssetDetail = {
    id: '',
    name: '',
    assetId: '',
    productName: '',
    serial: '',
    warranty: '',
    endOfLife: '',
    orderNumber: '',
    album: '',
    status: 'Available',
    category: '',
    department: '',
    supplier: '',
    location: '',
    value: '',
    purchaseDate: '',
    purchaseCost: undefined,
    scheduleAudit: '',
    notes: '',
    imageBase64: null,
  };

  ngOnInit(): void {
    this.mode = this.route.snapshot.data['mode'] || 'edit';
    this.assetId = this.route.snapshot.paramMap.get('id') || '';

    if (this.mode === 'create') {
      this.form.assetId = this.assetService.getNextAssetId();
    }

    if (this.assetId) {
      this.assetService.getAssetById(this.assetId).subscribe({
        next: (a) => {
          this.form = { ...a };
          if (a.imageBase64) {
            this.imagePreview = a.imageBase64;
          }
          if (this.mode === 'clone') {
            this.form.id = '';
            this.form.assetId = this.assetService.getNextAssetId();
            this.form.name = a.name + ' (Copy)';
            this.form.productName = a.productName + ' (Copy)';
          }
        },
        error: () => {
          this.toast.error('Failed to load asset');
          this.location.back();
        },
      });
    }
  }

  get pageTitle(): string {
    if (this.mode === 'clone') return 'Clone Asset';
    if (this.mode === 'create') return 'New Asset';
    return 'Edit Asset';
  }

  get breadcrumb(): string {
    if (this.mode === 'create') return 'Assets / New Asset';
    if (this.mode === 'clone') return 'Assets / Clone Asset';
    return 'Assets / Edit Asset';
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }
    const file = input.files[0];
    if (file.size > 5 * 1024 * 1024) {
      this.toast.warning('Image must be under 5 MB');
      input.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
      this.form.imageBase64 = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.imagePreview = null;
    this.form.imageBase64 = null;
  }

  onSave(): void {
    this.submitted = true;
    if (!this.form.productName.trim() || !this.form.serial.trim() || !this.form.status) {
      this.toast.warning('Please fill in all required fields');
      return;
    }
    this.saving = true;
    this.form.name = this.form.productName;

    if (this.mode === 'clone') {
      this.assetService.createAsset(this.form).subscribe({
        next: (created) => {
          this.saving = false;
          this.showResultOverlay(
            'success',
            'Cloned!',
            `"${created.productName}" has been created successfully.`,
            ['/inventory/assets', created.id]
          );
        },
        error: () => {
          this.saving = false;
          this.toast.error('Failed to clone asset');
        },
      });
    } else if (this.mode === 'create') {
      this.assetService.createAsset(this.form).subscribe({
        next: (created) => {
          this.saving = false;
          this.showResultOverlay(
            'success',
            'Created!',
            `"${created.productName}" has been added to inventory.`,
            ['/inventory/assets', created.id]
          );
        },
        error: () => {
          this.saving = false;
          this.toast.error('Failed to create asset');
        },
      });
    } else {
      this.assetService.updateAsset(this.form).subscribe({
        next: () => {
          this.saving = false;
          this.showResultOverlay(
            'success',
            'Updated!',
            `"${this.form.productName}" has been saved successfully.`,
            ['/inventory/assets', this.form.id]
          );
        },
        error: () => {
          this.saving = false;
          this.toast.error('Failed to save changes');
        },
      });
    }
  }

  onCancel(): void {
    this.location.back();
  }

  onResultClosed(): void {
    this.showResult = false;
    if (this.navigateTarget.length) {
      this.router.navigate(this.navigateTarget);
    }
  }

  private showResultOverlay(
    type: 'success' | 'error',
    title: string,
    message: string,
    navigateTo: string[]
  ): void {
    this.resultType = type;
    this.resultTitle = title;
    this.resultMessage = message;
    this.navigateTarget = navigateTo;
    this.showResult = true;
    setTimeout(() => this.onResultClosed(), 2000);
  }
}
