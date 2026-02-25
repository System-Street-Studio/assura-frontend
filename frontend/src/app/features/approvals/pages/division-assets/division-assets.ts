import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

interface Asset {
  id: string;
  name: string;
  type: string;
  status: 'Maintenance' | 'In Use' | 'Transferred';
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
  imports: [CommonModule, MatIconModule,RouterModule],
  templateUrl: './division-assets.html',
  styleUrls: ['./division-assets.css']
})
export class DivisionAssetsComponent {
  // Track the selected asset
  selectedAsset = signal<Asset | null>(null);

  assets = signal<Asset[]>([
    { 
      id: 'AST001', name: 'Dell Laptop', type: 'Laptop', status: 'Maintenance', 
      assignedTo: 'Harry Ekanayake', image: 'https://tse2.mm.bing.net/th/id/OIP.7L_Ho2CVPF-m88H7_UoM3AHaFS?pid=Api&P=0&h=220' ,
      specs: 'Intel Core i5, 16GB RAM, 512GB SSD', category: 'IT Equipment', division: 'IT', condition: 'Good'
    },
    { 
      id: 'AST002', name: 'HP ProDesk Mini', type: 'Desktop PC', status: 'In Use', 
      assignedTo: 'Jenny Athapaththu', image: 'assets/hp.png',
      specs: 'Intel Core i7, 32GB RAM, 1TB SSD', category: 'IT Equipment', division: 'IT', condition: 'Excellent'
    },
    { 
      id: 'AST003', name: 'Epson Projector', type: 'Projector', status: 'Transferred', 
      assignedTo: 'Harry Ekanayake', image: 'assets/epson.png',
      specs: '3LCD, 4000 Lumens, Full HD', category: 'Electronics', division: 'Marketing', condition: 'Good'
    },
    { 
      id: 'AST004', name: 'iPad Pro', type: 'Tablet', status: 'Maintenance', 
      assignedTo: 'Sarah Kodithuwakku', image: 'assets/ipad.png',
      specs: 'Apple M2 Chip, 12.9-inch Display', category: 'Mobile', division: 'HR', condition: 'Fair'
    },
    { 
      id: 'AST001', name: 'Dell Laptop', type: 'Laptop', status: 'Maintenance', 
      assignedTo: 'Harry Ekanayake', image: 'assets/dell.png',
      specs: 'Intel Core i5, 16GB RAM, 512GB SSD', category: 'IT Equipment', division: 'IT', condition: 'Good'
    },
    { 
      id: 'AST002', name: 'HP ProDesk Mini', type: 'Desktop PC', status: 'In Use', 
      assignedTo: 'Jenny Athapaththu', image: 'https://tse2.mm.bing.net/th/id/OIP.7L_Ho2CVPF-m88H7_UoM3AHaFS?pid=Api&P=0&h=220' ,
      specs: 'Intel Core i7, 32GB RAM, 1TB SSD', category: 'IT Equipment', division: 'IT', condition: 'Excellent'
    },
    { 
      id: 'AST003', name: 'Epson Projector', type: 'Projector', status: 'Transferred', 
      assignedTo: 'Harry Ekanayake', image: 'assets/epson.png',
      specs: '3LCD, 4000 Lumens, Full HD', category: 'Electronics', division: 'Marketing', condition: 'Good'
    },
    { 
      id: 'AST004', name: 'iPad Pro', type: 'Tablet', status: 'Maintenance', 
      assignedTo: 'Sarah Kodithuwakku', image: 'assets/ipad.png',
      specs: 'Apple M2 Chip, 12.9-inch Display', category: 'Mobile', division: 'HR', condition: 'Fair'
    }
  ]);

  viewAsset(asset: Asset) {
    this.selectedAsset.set(asset);
  }

  goBack() {
    this.selectedAsset.set(null);
  }
  /*
  viewMode: 'grid' | 'list' = 'grid';

toggleView(mode: 'grid' | 'list') {
  this.viewMode = mode;
}*/
}