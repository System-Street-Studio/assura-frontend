import { Component, computed, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';
import { AssetService } from '../../../../features/inventory/services/asset.service';
import { AssetDetail } from '../../../../features/inventory/models/asset.model';

interface Asset {
  assetId: string;
  assetName: string;
  image: string;
  conditionStatus: string;
  assignedDate: string;
  status: string;
  category: string;
  description?: string;
  assignedEmployee: string;
}

@Component({
  selector: 'app-employee-assets',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, PaginationComponent],
  templateUrl: './employee-assets.html',
  styleUrls: ['./employee-assets.css']
})
export class EmployeeAssetsComponent implements OnInit {
  private assetService = inject(AssetService);
  
  searchTerm = signal('');
  loading = signal(true);

  onSearchChange(value: string) {
    this.searchTerm.set(value);
    this.currentPage.set(1);
  }
  selectedAsset = signal<Asset | null>(null);
  selectedStatus = signal('');

  // Pagination
  pageSize = 6;
  currentPage = signal(1);

  assets = signal<Asset[]>([]);

  ngOnInit() {
    this.assetService.getAll().subscribe({
      next: (data: AssetDetail[]) => {
        const mapped = data.map(a => ({
          assetId: a.assetCode,
          assetName: a.productName,
          category: a.categoryName,
          description: a.notes,
          assignedEmployee: a.assignedUserName || 'Me',
          assignedDate: a.assetDate,
          status: this.formatStatus(a.status),
          conditionStatus: 'Good',
          image: this.getPlaceholderImage(a.categoryName)
        }));
        this.assets.set(mapped);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  private formatStatus(status: string): string {
    const map: Record<string, string> = {
      'InUse': 'In Use',
      'InStore': 'Stored',
      'UnderMaintenance': 'Maintenance',
      'Discarded': 'Discarded'
    };
    return map[status] || status;
  }

  private getPlaceholderImage(category: string): string {
    if (category.toLowerCase().includes('laptop') || category.toLowerCase().includes('electronic')) {
      return 'https://tse2.mm.bing.net/th/id/OIP.7L_Ho2CVPF-m88H7_UoM3AHaFS?pid=Api&P=0&h=220';
    }
    if (category.toLowerCase().includes('chair') || category.toLowerCase().includes('furniture')) {
      return 'https://i5.walmartimages.com/seo/Lacoo-Faux-Leather-High-Back-Executive-Office-Chair-with-Lumbar-Support-Black_bf489981-70b3-42c2-972e-93ea9995756c.160b1f502b31db454018d773aed8b003.jpeg';
    }
    return 'https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/peripherals/monitors/e-series/e2425hsm/media-gallery/monitor-dell-pro-e2425hsm-bk-gallery-1.psd?fmt=png-alpha&pscan=auto&scl=1&hei=804&wid=868&qlt=100,1&resMode=sharp2&size=868,804&chrss=full';
  }

  filteredAssets = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const status = this.selectedStatus();

    return this.assets().filter(asset => {
      const matchesTerm = asset.assetName.toLowerCase().includes(term);
      const matchesStatus = status ? asset.status === status : true;
      return matchesTerm && matchesStatus;
    });
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredAssets().length / this.pageSize)));

  paginatedAssets = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredAssets().slice(start, start + this.pageSize);
  });

  pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  onPageChange(page: number) {
    this.currentPage.set(page);
  }


  viewDetails(asset: Asset) {
    this.selectedAsset.set(asset);
  }

  backToList() {
    this.selectedAsset.set(null);
  }
}