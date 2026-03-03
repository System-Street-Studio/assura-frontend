
import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

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
  imports: [CommonModule, FormsModule,MatIconModule],
  templateUrl: './employee-assets.html',
  styleUrls: ['./employee-assets.css']
})
export class EmployeeAssetsComponent {
  searchTerm = signal('');
  selectedAsset = signal<Asset | null>(null);
  selectedStatus = signal('');

  assets = signal<Asset[]>([
    
  {
    assetId: 'AST001',
    assetName: 'Dell Latitude 5520',
    category: 'Electronics',
    description: 'Processor: Intel Core i5 11th Gen, RAM: 16GB, Storage: 512GB SSD',
    assignedEmployee: 'Harry Ekanayeka (EST001)',
    assignedDate: '2023-10-20',
    status: 'In Use',
    conditionStatus: 'Good',
    image: 'https://tse2.mm.bing.net/th/id/OIP.7L_Ho2CVPF-m88H7_UoM3AHaFS?pid=Api&P=0&h=220'
  },
  {
    assetId: 'AST002',
    assetName: 'Ergonomic Office Chair',
    category: 'Furniture',
    description: 'High-back executive chair with lumbar support and adjustable height',
    assignedEmployee: 'Harry Ekanayeka (EST001)',
    assignedDate: '2023-10-22',
    status: 'Transferred',
    conditionStatus: 'Good',
    image: 'https://i5.walmartimages.com/seo/Lacoo-Faux-Leather-High-Back-Executive-Office-Chair-with-Lumbar-Support-Black_bf489981-70b3-42c2-972e-93ea9995756c.160b1f502b31db454018d773aed8b003.jpeg'
  },
  {
    assetId: 'AST003',
    assetName: 'Samsung 24" LED Monitor',
    category: 'Electronics',
    description: '24-inch Full HD LED Monitor, HDMI & VGA support, 75Hz refresh rate',
    assignedEmployee: 'Harry Ekanayeka (EST001)',
    assignedDate: '2023-10-25',
    status: 'Maintenance',
    conditionStatus: 'Good',
    image: 'https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/peripherals/monitors/e-series/e2425hsm/media-gallery/monitor-dell-pro-e2425hsm-bk-gallery-1.psd?fmt=png-alpha&pscan=auto&scl=1&hei=804&wid=868&qlt=100,1&resMode=sharp2&size=868,804&chrss=full'
  },
  {
    assetId: 'AST004',
    assetName: 'Apple iPad 9th Gen',
    category: 'Electronics',
    description: '10.2-inch Retina Display, A13 Bionic Chip, 64GB Storage',
    assignedEmployee: 'Harry Ekanayeka (EST001)',
    assignedDate: '2023-10-28',
    status: 'In Use',
    conditionStatus: 'Excellent',
    image: 'https://m.media-amazon.com/images/I/61NGnpjoRDL._AC_SL1500_.jpg'
  },
  {
    assetId: 'AST005',
    assetName: 'Canon Scanner X2',
    category: 'Electronics',
    description: 'High-speed document scanner, USB connectivity, 40ppm scanning speed',
    assignedEmployee: 'Harry Ekanayeka (EST001)',
    assignedDate: '2023-11-01',
    status: 'Maintenance',
    conditionStatus: 'Good',
    image: 'https://mediaserver.goepson.com/ImConvServlet/imconv/e381a1e16d14618eb2c208abe70e26c894553c9a/1200Wx1200H?use=banner&hybrisId=B2C&assetDescr=FY22_SCN_V39II_02Photo'
  },
  {
    assetId: 'AST006',
    assetName: 'Projector Screen 100"',
    category: 'Electronics',
    description: '100-inch wall-mounted projector screen, matte white finish',
    assignedEmployee: 'Harry Ekanayeka (EST001)',
    assignedDate: '2023-11-05',
    status: 'Transferred',
    conditionStatus: 'Good',
    image: 'https://tse1.mm.bing.net/th/id/OIP.vTX7YEF-ZTTFkY6_LkYfuwHaHZ?pid=Api&P=0&h=220'
  }


  ]);

  filteredAssets = computed(() => {
  const term = this.searchTerm().toLowerCase();
  const status = this.selectedStatus();

  return this.assets().filter(asset => {
    const matchesTerm = asset.assetName.toLowerCase().includes(term);
    const matchesStatus = status ? asset.status === status : true;
    return matchesTerm && matchesStatus;
  });
});

 
  viewDetails(asset: Asset) {
    this.selectedAsset.set(asset);
  }

  backToList() {
    this.selectedAsset.set(null);
  }
}