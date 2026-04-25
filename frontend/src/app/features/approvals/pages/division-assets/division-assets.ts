import { Component, signal, computed, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AssetService } from '../../../../core/services/asset.service';

interface Asset {
  id: string;
  name: string;
  type: string;
  status: string;
  assignedTo: string;
  image: string;
  specs: string;
  category: string;
  division: string;
  condition: string;
}

@Component({
  selector: 'app-division-assets',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule, FormsModule],
  templateUrl: './division-assets.html',
  styleUrls: ['./division-assets.css']
})
export class DivisionAssetsComponent implements OnInit {
  private assetService = inject(AssetService);

  assets = signal<Asset[]>([]);

  totalAssetsCount = computed(() => this.assets().length);
  inUseCount = computed(() => this.assets().filter(a => a.status === 'In Use').length);
  maintenanceCount = computed(() => this.assets().filter(a => a.status === 'Maintenance').length);

  ngOnInit() {
    this.loadAssets();
  }

  loadAssets() {
    this.assetService.getAssets().subscribe({
      next: (data: any[]) => {
        const mapped = data.map(a => ({
          id: a.assetCode || `AST${a.id}`,
          name: a.productName || 'Unknown Asset',
          type: a.productName || 'Asset',
          status: this.mapStatus(a.status),
          assignedTo: a.assignedUserName || 'Unassigned',
          image: this.getDefaultImage(a.categoryName),
          specs: a.notes || 'No specifications provided',
          category: a.categoryName,
          division: a.divisionName,
          condition: 'Unknown' // Not directly in DTO
        }));
        this.assets.set(mapped);
      }
    });
  }

  private mapStatus(status: number): string {
    switch (status) {
      case 0: return 'Disconnected';
      case 1: return 'In Use';
      case 2: return 'Maintenance';
      case 3: return 'Transferred';
      case 4: return 'Disposed';
      default: return 'Unknown';
    }
  }

  private getDefaultImage(category: string): string {
    if (category?.toLowerCase().includes('laptop')) return 'https://tse2.mm.bing.net/th/id/OIP.7L_Ho2CVPF-m88H7_UoM3AHaFS?pid=Api&P=0&h=220';
    if (category?.toLowerCase().includes('device')) return 'https://tse4.mm.bing.net/th/id/OIP.sJPzc8VZD1qRzKUvudISdwHaFj?pid=Api&P=0&h=220';
    return 'https://tse3.mm.bing.net/th/id/OIP.n1PgBAsks9Nsp78Q3NvXngHaHa?pid=Api&P=0&h=220';
  }

  // Dropdown selections
  selectedCategory = signal<string>('all');
  selectedStatus = signal<string>('all');
  searchQuery = signal<string>('');

  viewAsset(asset: Asset) {
    this.selectedAsset.set(asset);
  }

  goBack() {
    this.selectedAsset.set(null);
  }

  // Action methods
  setFilterCategory(val: string) {
    this.selectedCategory.set(val);
    this.showCategoryMenu.set(false);
  }

  setFilterStatus(val: string) {
    this.selectedStatus.set(val);
    this.showStatusMenu.set(false);
  }

  onSearchChange(event: any) {
    this.searchQuery.set(event.target.value);
  }

  filteredAssets = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const cat = this.selectedCategory();
    const stat = this.selectedStatus();

    return this.assets().filter(asset => {
      const categoryMatch = cat === 'all' || asset.category === cat;
      const statusMatch = stat === 'all' || asset.status === stat;
      const searchMatch = !query ||
        asset.name.toLowerCase().includes(query) ||
        asset.id.toLowerCase().includes(query);

      return categoryMatch && statusMatch && searchMatch;
    });
  });

  // UI elements
  showCategoryMenu = signal<boolean>(false);
  showStatusMenu = signal<boolean>(false);
  selectedAsset = signal<Asset | null>(null);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const inCategoryFilter = target.closest('[data-filter="category"]') !== null;
    const inStatusFilter = target.closest('[data-filter="status"]') !== null;

    if (this.showCategoryMenu() && !inCategoryFilter) {
      this.showCategoryMenu.set(false);
    }
    if (this.showStatusMenu() && !inStatusFilter) {
      this.showStatusMenu.set(false);
    }
  }
}