import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Asset } from './models/asset.model';

@Component({
  selector: 'app-my-assets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-assets.html',
  styleUrls: ['./my-assets.css']
})
export class MyAssetsComponent implements OnInit {
  assets: Asset[] = [
    { id: '1', name: 'Dell XPS 15 9520', type: 'Laptop', serialNumber: 'DXP-9520-2023', division: 'Information Technology', status: 'Active' },
    { id: '2', name: 'Logitech MX Master 3S', type: 'Peripheral', serialNumber: 'LOGI-MX3-112', division: 'Information Technology', status: 'Active' },
    { id: '3', name: 'LG UltraFine 4K Display', type: 'Monitor', serialNumber: 'LG-4K-9901', division: 'Astronomy', status: 'Maintenance' },
    { id: '4', name: 'Cisco Integrated Router', type: 'Networking', serialNumber: 'CISCO-ISR-4431', division: 'Information Technology', status: 'Assigned' },
    { id: '5', name: 'iPad Pro 12.9"', type: 'Peripheral', serialNumber: 'IPAD-129-2024', division: 'Design', status: 'Active' },
    { id: '6', name: 'Sony WH-1000XM5', type: 'Peripheral', serialNumber: 'SONY-WH5-556', division: 'Sales', status: 'Active' },
    { id: '7', name: 'Lenovo ThinkPad X1', type: 'Laptop', serialNumber: 'LEN-X1-4478', division: 'Human Resources', status: 'Active' },
    { id: '8', name: 'Dell UltraSharp 27"', type: 'Monitor', serialNumber: 'DELL-U27-009', division: 'Marketing', status: 'Active' },
    { id: '9', name: 'Ubiquiti Dream Machine', type: 'Networking', serialNumber: 'UBIQ-UDM-882', division: 'Security', status: 'Active' }
  ];

  filteredAssets: Asset[] = [];
  searchQuery = '';
  selectedAsset: Asset | null = null;

  ngOnInit() {
    this.filteredAssets = [...this.assets];
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
}
