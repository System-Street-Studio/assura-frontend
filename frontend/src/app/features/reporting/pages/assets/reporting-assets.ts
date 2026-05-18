import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface ReportingAssetItem {
  id: string;
  selected: boolean;
  swatch: string;
  imageClass: string;
  product: string;
  status: string;
  checkedBy?: string;
  checkedRole?: string;
  assuraName: string;
  serial: string;
  warranty: string;
  endOfLife: string;
  codeNumber: string;
}

@Component({
  selector: 'app-reporting-assets',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reporting-assets.html',
  styleUrls: ['../reporting-shared.css', './reporting-assets.css'],
})
export class ReportingAssetsComponent {
  readonly assets: ReportingAssetItem[] = [
    {
      id: 'AST-1004',
      selected: true,
      swatch: '#0f766e',
      imageClass: 'laptop',
      product: 'Latitude 7440',
      status: 'Active',
      checkedBy: 'Lina Perez',
      checkedRole: 'Auditor',
      assuraName: 'Operations Fleet',
      serial: 'DL74-9912',
      warranty: 'Nov 2027',
      endOfLife: '2029',
      codeNumber: 'CODE-4412',
    },
    {
      id: 'AST-1012',
      selected: false,
      swatch: '#f59e0b',
      imageClass: 'monitor',
      product: 'Dell 27 Monitor',
      status: 'Pending',
      assuraName: 'HQ Visual Bank',
      serial: 'MON-1187',
      warranty: 'May 2026',
      endOfLife: '2028',
      codeNumber: 'CODE-8821',
    },
    {
      id: 'AST-1048',
      selected: true,
      swatch: '#2563eb',
      imageClass: 'phone',
      product: 'iPhone 15',
      status: 'Flagged',
      checkedBy: 'Aster M.',
      checkedRole: 'Audit Lead',
      assuraName: 'Field Devices',
      serial: 'APL-7741',
      warranty: 'Jan 2027',
      endOfLife: '2028',
      codeNumber: 'CODE-9013',
    },
    {
      id: 'AST-1089',
      selected: false,
      swatch: '#7c3aed',
      imageClass: 'tablet',
      product: 'Surface Pro 10',
      status: 'Archived',
      checkedBy: 'Brian O.',
      checkedRole: 'Auditor',
      assuraName: 'Legacy Pool',
      serial: 'SUR-4503',
      warranty: 'Expired',
      endOfLife: '2026',
      codeNumber: 'CODE-2208',
    },
  ];

  get selectedCount(): number {
    return this.assets.filter((asset) => asset.selected).length;
  }
}
