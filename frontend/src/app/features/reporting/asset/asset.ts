import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface ReportingAsset {
  selected?: boolean;
  swatch: string;
  imageClass: string;
  id: string;
  product: string;
  status: 'Assigned' | 'In Repair' | 'Available' | 'Retired';
  checkedBy: string;
  checkedRole: string;
  assuraName: string;
  serial: string;
  warranty: string;
  endOfLife: string;
  codeNumber: string;
}

@Component({
  selector: 'app-reporting-asset',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './asset.html',
  styleUrls: ['./asset.css'],
})
export class ReportingAssetComponent {
  readonly assets: ReportingAsset[] = [
    {
      selected: true,
      swatch: '#13a5a5',
      imageClass: 'laptop',
      id: 'T00001',
      product: 'XPS 13"',
      status: 'Assigned',
      checkedBy: 'Nathan Miller',
      checkedRole: 'Auditor',
      assuraName: 'Laptop-DVP13-IN',
      serial: 'A2CTQ3',
      warranty: 'Expired 4 months ago',
      endOfLife: '5 months left, JhyTech 22, 2026',
      codeNumber: 'SKC332',
    },
    {
      selected: true,
      swatch: '#194d4f',
      imageClass: 'phone',
      id: 'T00011',
      product: 'ThinPad X13 Gen',
      status: 'Assigned',
      checkedBy: 'Evelyn Harper',
      checkedRole: 'Admin',
      assuraName: 'Laptop-School-IT13',
      serial: 'PAV3C4X',
      warranty: 'Expired 6 months ago',
      endOfLife: '4 years left, December 25, 2028',
      codeNumber: 'YH6NG',
    },
    {
      swatch: '#cfd8dc',
      imageClass: 'printer',
      id: 'T00002',
      product: 'iPhone 14 Max',
      status: 'In Repair',
      checkedBy: 'Derek C. Winston',
      checkedRole: 'App',
      assuraName: 'iPhone-1-IT-MX',
      serial: 'A3NLVTIW402',
      warranty: '7 days left, December 27, 2025',
      endOfLife: 'Over 1 year July 24, 2026',
      codeNumber: 'TR4J7E',
    },
    {
      swatch: '#6f767c',
      imageClass: 'server',
      id: 'T00023',
      product: 'XPS 13"',
      status: 'Assigned',
      checkedBy: 'Richard Carson',
      checkedRole: 'Manager',
      assuraName: 'Laptop-XPS-13',
      serial: 'P7KASVF6Y77',
      warranty: 'Expired 4 months ago',
      endOfLife: '2 months remaining',
      codeNumber: 'PRK2LHN24B3TF',
    },
    {
      swatch: '#d2d6d8',
      imageClass: 'desktop',
      id: 'T00028',
      product: 'iPhone 14 Max',
      status: 'Available',
      checkedBy: 'Nathan Harris',
      checkedRole: 'Manager',
      assuraName: 'iPhone-1-JAN',
      serial: 'MTFPN89KYC',
      warranty: '2 years left, Jan 30, 2029',
      endOfLife: 'Over 1 year July 29, 2029',
      codeNumber: '23XHFP',
    },
    {
      swatch: '#7a3fb1',
      imageClass: 'tablet',
      id: 'T00040',
      product: 'Mega 27',
      status: 'Retired',
      checkedBy: '',
      checkedRole: '',
      assuraName: 'Table Top-0178',
      serial: 'BBFK1353GSB',
      warranty: 'Expired 6 years ago',
      endOfLife: 'Over 2 years left',
      codeNumber: 'JJ1BC',
    },
  ];

  get selectedCount(): number {
    return this.assets.filter((asset) => asset.selected).length;
  }
}
