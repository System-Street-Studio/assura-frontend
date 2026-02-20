
import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-assets.html',
  styleUrls: ['./employee-assets.css']
})
export class EmployeeAssetsComponent {
  searchTerm = signal('');
  selectedAsset = signal<Asset | null>(null);

  assets = signal<Asset[]>([
    { 
      assetId: 'AST001', assetName: 'Dell Laptop', category: 'Electronics', 
      description: 'Processor: Intel Core i5,  RAM: 16 GB, Storage: 512 GB SSD',
      assignedEmployee: 'Harry Ekanayeka (EST001)', assignedDate: '2023-10-20', 
      status: 'In Use', conditionStatus: 'Good', 
      image:'https://tse2.mm.bing.net/th/id/OIP.7L_Ho2CVPF-m88H7_UoM3AHaFS?pid=Api&P=0&h=220' 
    },
    { 
      assetId: 'AST002', assetName: 'Office Chair', category: 'Furniture', 
      assignedEmployee: 'Harry Ekanayeka (EST001)', assignedDate: '2023-10-22', 
      status: 'In Use', conditionStatus: 'Good', 
      image: 'https://i5.walmartimages.com/seo/Lacoo-Faux-Leather-High-Back-Executive-Office-Chair-with-Lumbar-Support-Black_bf489981-70b3-42c2-972e-93ea9995756c.160b1f502b31db454018d773aed8b003.jpeg' 
    },
   { 
      assetId: 'AST001', assetName: 'Dell Laptop', category: 'Electronics', 
      description: 'Processor: Intel Core i5,  RAM: 16 GB, Storage: 512 GB SSD',
      assignedEmployee: 'Harry Ekanayeka (EST001)', assignedDate: '2023-10-20', 
      status: 'In Use', conditionStatus: 'Good', 
      image:'https://tse2.mm.bing.net/th/id/OIP.7L_Ho2CVPF-m88H7_UoM3AHaFS?pid=Api&P=0&h=220' 
    },
    { 
      assetId: 'AST002', assetName: 'Office Chair', category: 'Furniture', 
      assignedEmployee: 'Harry Ekanayeka (EST001)', assignedDate: '2023-10-22', 
      status: 'In Use', conditionStatus: 'Good', 
      image: 'https://i5.walmartimages.com/seo/Lacoo-Faux-Leather-High-Back-Executive-Office-Chair-with-Lumbar-Support-Black_bf489981-70b3-42c2-972e-93ea9995756c.160b1f502b31db454018d773aed8b003.jpeg' 
    },
    { 
      assetId: 'AST001', assetName: 'Dell Laptop', category: 'Electronics', 
      description: 'Processor: Intel Core i5,  RAM: 16 GB, Storage: 512 GB SSD',
      assignedEmployee: 'Harry Ekanayeka (EST001)', assignedDate: '2023-10-20', 
      status: 'In Use', conditionStatus: 'Good', 
      image:'https://tse2.mm.bing.net/th/id/OIP.7L_Ho2CVPF-m88H7_UoM3AHaFS?pid=Api&P=0&h=220' 
    },

  ]);

  filteredAssets = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.assets().filter(asset => asset.assetName.toLowerCase().includes(term));
  });

 
  viewDetails(asset: Asset) {
    this.selectedAsset.set(asset);
  }

  backToList() {
    this.selectedAsset.set(null);
  }
}