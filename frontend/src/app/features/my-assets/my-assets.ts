import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Asset } from './models/asset.model';
import { AssetsService } from '../../services/assets.service';

@Component({
  selector: 'app-my-assets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-assets.html',
  styleUrls: ['./my-assets.css']
})
export class MyAssetsComponent implements OnInit {
  assets: Asset[] = [];
  filteredAssets: Asset[] = [];
  searchQuery: string = '';
  selectedAsset: Asset | null = null;
  isLoading = true;
  isAddAssetModalOpen = false;
  newAsset: Partial<Asset> = {
    name: '',
    type: 'Laptop',
    serialNumber: '',
    division: '',
    status: 'Active'
  };

  constructor(
    private assetsService: AssetsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.assetsService.getAll().subscribe({
      next: (data) => {
        this.assets = data;
        this.filteredAssets = [...this.assets];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load assets:', err);
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onSearch() {
    this.filteredAssets = this.assets.filter(asset =>
      asset.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  selectAsset(asset: Asset) {
    this.selectedAsset = asset;
  }

  closeDetail() {
    this.selectedAsset = null;
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  openAddAssetModal() {
    this.isAddAssetModalOpen = true;
  }

  closeAddAssetModal() {
    this.isAddAssetModalOpen = false;
    this.newAsset = {
      name: '',
      type: 'Laptop',
      serialNumber: '',
      division: '',
      status: 'Active'
    };
  }

  submitAddAsset() {
    console.log("Submitting new asset:", this.newAsset);
    
    if (!this.newAsset.name || !this.newAsset.serialNumber) {
      alert('Please fill in the required fields (Name & Serial Number).');
      return;
    }

    this.assetsService.create(this.newAsset).subscribe({
      next: (id) => {
        // Fetch fresh list from backend
        this.assetsService.getAll().subscribe({
          next: (data) => {
            this.assets = data;
            this.onSearch(); // Refresh the list with filters
            this.closeAddAssetModal();
            this.cdr.markForCheck();
          }
        });
      },
      error: (err) => {
        console.error('Failed to create asset:', err);
        alert('Failed to add asset. Please try again.');
        this.cdr.markForCheck();
      }
    });
  }
}
