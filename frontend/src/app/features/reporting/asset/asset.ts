import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

/* =========================================================
   ASSET TIMELINE INTERFACE
   Defines timeline history structure for assets.
========================================================= */
interface AssetTimelineItem {

  /* Timeline event title */
  label: string;

  /* Timeline event description */
  detail: string;

  /* Event date */
  date: string;

  /* Timeline indicator color */
  tone: 'green' | 'blue' | 'orange' | 'gray';
}

/* =========================================================
   REPORTING ASSET INTERFACE
   Defines asset object structure used in asset list.
========================================================= */
interface ReportingAsset {

  /* Checkbox selection state */
  selected?: boolean;

  /* Asset theme/accent color */
  swatch: string;

  /* CSS image class */
  imageClass: string;

  /* Asset ID */
  id: string;

  /* Product name */
  product: string;

  /* Asset category */
  category: string;

  /* Asset status */
  status: 'Assigned' | 'In Repair' | 'Available' | 'Retired';

  /* Asset health condition */
  health: 'Good' | 'Warning' | 'Critical';

  /* Person who checked asset */
  checkedBy: string;

  /* Role of checker */
  checkedRole: string;

  /* Internal Assura name */
  assuraName: string;

  /* Device serial number */
  serial: string;

  /* Warranty details */
  warranty: string;

  /* Warranty state */
  warrantyStatus: 'Valid' | 'Expired';

  /* End of life period */
  endOfLife: string;

  /* Internal code number */
  codeNumber: string;

  /* Asset location */
  location: string;

  /* Purchase date */
  purchaseDate: string;

  /* Purchase amount */
  purchasePrice: string;

  /* Asset activity timeline */
  timeline: AssetTimelineItem[];
}

/* =========================================================
   COMPONENT DECORATOR
   Angular standalone component configuration.
========================================================= */
@Component({

  /* Component selector */
  selector: 'app-reporting-asset',

  /* Standalone Angular component */
  standalone: true,

  /* Angular modules used */
  imports: [CommonModule],

  /* HTML template path */
  templateUrl: './asset.html',

  /* CSS stylesheet path */
  styleUrls: ['./asset.css'],
})

/* =========================================================
   REPORTING ASSET COMPONENT
========================================================= */
export class ReportingAssetComponent {

  /* =========================================================
     ASSET DATA ARRAY
     Main asset list displayed in table.
  ========================================================= */
  readonly assets: ReportingAsset[] = [

    /* =========================================================
         ASSET 1
         Dell XPS Laptop
    ========================================================== */
    {
      selected: true,
      swatch: '#13a5a5',
      imageClass: 'laptop',
      id: 'T00001',
      product: 'XPS 13"',
      category: 'Laptops',
      status: 'Assigned',
      health: 'Good',
      checkedBy: 'Nathan Miller',
      checkedRole: 'Auditor',
      assuraName: 'Laptop-DVP13-IN',
      serial: 'A2CTQ3',
      warranty: 'Expired 4 months ago',
      warrantyStatus: 'Expired',
      endOfLife: '5 months left 22 Feb 2026',
      codeNumber: 'SKC332',
      location: 'IT Department',
      purchaseDate: '22 Feb 2024',
      purchasePrice: '$1,249.00',

      /* Asset timeline history */
      timeline: [

        /* Purchase activity */
        {
          label: 'Purchased',
          detail: 'Asset purchased and registered',
          date: '22 Feb 2024',
          tone: 'green',
        },

        /* Assignment activity */
        {
          label: 'Assigned',
          detail: 'Assigned to IT Department',
          date: '25 Feb 2024',
          tone: 'blue',
        },

        /* Maintenance activity */
        {
          label: 'Maintenance',
          detail: 'General check-up completed',
          date: '10 Jan 2025',
          tone: 'orange',
        },

        /* Warranty expiry activity */
        {
          label: 'Warranty Expired',
          detail: 'Warranty period ended',
          date: '22 Feb 2025',
          tone: 'gray',
        },
      ],
    },

    /* =========================================================
         ASSET 2
         ThinkPad Laptop
    ========================================================== */
    {
      selected: true,
      swatch: '#194d4f',
      imageClass: 'laptop dark',
      id: 'T00011',
      product: 'ThinkPad X13 Gen',
      category: 'Laptops',
      status: 'Assigned',
      health: 'Good',
      checkedBy: 'Evelyn Harper',
      checkedRole: 'Admin',
      assuraName: 'Laptop-School-IT13',
      serial: 'PAV3C4X',
      warranty: 'Expired 6 months ago',
      warrantyStatus: 'Expired',
      endOfLife: '4 years left 25 Dec 2028',
      codeNumber: 'YH6NG',
      location: 'Admin Office',
      purchaseDate: '25 Dec 2024',
      purchasePrice: '$1,099.00',

      /* Timeline activities */
      timeline: [

        {
          label: 'Purchased',
          detail: 'Asset purchased and registered',
          date: '25 Dec 2024',
          tone: 'green',
        },

        {
          label: 'Assigned',
          detail: 'Assigned to Admin Office',
          date: '26 Dec 2024',
          tone: 'blue',
        },

        {
          label: 'Audit Check',
          detail: 'Physical verification completed',
          date: '18 May 2026',
          tone: 'green',
        },
      ],
    },

    /* =========================================================
         ASSET 3
         iPhone In Repair
    ========================================================== */
    {
      swatch: '#cfd8dc',
      imageClass: 'phone',
      id: 'T00002',
      product: 'iPhone 14 Max',
      category: 'Mobile Phones',
      status: 'In Repair',
      health: 'Warning',
      checkedBy: 'Derek C. Winston',
      checkedRole: 'App',
      assuraName: 'iPhone-1-IT-MX',
      serial: 'A3NLVTIW402',
      warranty: 'Valid 7 days left',
      warrantyStatus: 'Valid',
      endOfLife: 'Over 1 year 24 Jul 2026',
      codeNumber: 'TR4J7E',
      location: 'Mobile Store',
      purchaseDate: '24 Jul 2024',
      purchasePrice: '$899.00',

      timeline: [

        {
          label: 'Purchased',
          detail: 'Mobile device registered',
          date: '24 Jul 2024',
          tone: 'green',
        },

        {
          label: 'Repair',
          detail: 'Screen and battery check in progress',
          date: '15 May 2026',
          tone: 'orange',
        },
      ],
    },

    /* =========================================================
         ASSET 4
         Finance Department Laptop
    ========================================================== */
    {
      swatch: '#6f767c',
      imageClass: 'laptop',
      id: 'T00023',
      product: 'XPS 13"',
      category: 'Laptops',
      status: 'Assigned',
      health: 'Good',
      checkedBy: 'Richard Carson',
      checkedRole: 'Manager',
      assuraName: 'Laptop-XPS-13',
      serial: 'P7KASVF6Y77',
      warranty: 'Expired 4 months ago',
      warrantyStatus: 'Expired',
      endOfLife: '2 months left',
      codeNumber: 'PRK2LHN24B3TF',
      location: 'Finance Dept',
      purchaseDate: '18 Jan 2024',
      purchasePrice: '$1,249.00',

      timeline: [

        {
          label: 'Purchased',
          detail: 'Asset purchased and registered',
          date: '18 Jan 2024',
          tone: 'green',
        },

        {
          label: 'Transferred',
          detail: 'Transferred to Finance Dept',
          date: '17 May 2026',
          tone: 'blue',
        },
      ],
    },

    /* =========================================================
         ASSET 5
         Available iPhone
    ========================================================== */
    {
      swatch: '#d2d6d8',
      imageClass: 'phone light',
      id: 'T00028',
      product: 'iPhone 14 Max',
      category: 'Mobile Phones',
      status: 'Available',
      health: 'Good',
      checkedBy: 'Nathan Harris',
      checkedRole: 'Manager',
      assuraName: 'iPhone-1-JAN',
      serial: 'MTFPN89KYC',
      warranty: 'Valid 2 years left',
      warrantyStatus: 'Valid',
      endOfLife: 'Over 1 year 29 Jul 2029',
      codeNumber: '23XHFP',
      location: 'Main Store',
      purchaseDate: '29 Jul 2025',
      purchasePrice: '$899.00',

      timeline: [

        {
          label: 'Purchased',
          detail: 'Device registered in main store',
          date: '29 Jul 2025',
          tone: 'green',
        },

        {
          label: 'Available',
          detail: 'Ready for assignment',
          date: '18 May 2026',
          tone: 'blue'
        },
      ],
    },

    /* =========================================================
         ASSET 6
         Retired Tablet
    ========================================================== */
    {
      swatch: '#7a3fb1',
      imageClass: 'tablet',
      id: 'T00040',
      product: 'Mega 27',
      category: 'Tablets',
      status: 'Retired',
      health: 'Critical',
      checkedBy: '',
      checkedRole: '',
      assuraName: 'Table Top-0178',
      serial: 'BBFK1353GSB',
      warranty: 'Expired 6 years ago',
      warrantyStatus: 'Expired',
      endOfLife: 'Over 2 years left',
      codeNumber: 'JJ1BC',
      location: 'Store Room',
      purchaseDate: '11 Jan 2020',
      purchasePrice: '$640.00',

      timeline: [

        {
          label: 'Purchased',
          detail: 'Tablet registered',
          date: '11 Jan 2020',
          tone: 'green'
        },

        {
          label: 'Retired',
          detail: 'Marked for disposal',
          date: '16 May 2026',
          tone: 'gray'
        },
      ],
    },
  ];

  /* =========================================================
     DEFAULT SELECTED ASSET
     Initially selected asset in details panel.
  ========================================================= */
  selectedAsset: ReportingAsset = this.assets[0];

  /* =========================================================
     SELECTED COUNT GETTER
     Counts selected assets dynamically.
  ========================================================= */
  get selectedCount(): number {

    return this.assets.filter((asset) => asset.selected).length;
  }

  /* =========================================================
     SELECT ASSET METHOD
     Updates selected asset details panel.
  ========================================================= */
  selectAsset(asset: ReportingAsset): void {

    this.selectedAsset = asset;
  }
}