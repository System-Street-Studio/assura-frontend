import { Component, signal ,computed} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
  imports: [CommonModule, MatIconModule,RouterModule,FormsModule],
  templateUrl: './division-assets.html',
  styleUrls: ['./division-assets.css']
})
export class DivisionAssetsComponent {
  

  assets = signal<Asset[]>([
    { 
      id: 'AST001', name: 'Dell Laptop', type: 'Laptop', status: 'Maintenance', 
      assignedTo: 'Harry Ekanayake', image: 'https://tse2.mm.bing.net/th/id/OIP.7L_Ho2CVPF-m88H7_UoM3AHaFS?pid=Api&P=0&h=220' ,
      specs: 'Intel Core i5, 16GB RAM, 512GB SSD', category: 'IT Equipment', division: 'IT', condition: 'Good'
    },
    { 
      id: 'AST002', name: 'HP ProDesk Mini', type: 'Desktop PC', status: 'In Use', 
      assignedTo: 'Jenny Athapaththu', image: 'https://tse4.mm.bing.net/th/id/OIP.sJPzc8VZD1qRzKUvudISdwHaFj?pid=Api&P=0&h=220',
      specs: 'Intel Core i7, 32GB RAM, 1TB SSD', category: 'IT Equipment', division: 'IT', condition: 'Excellent'
    },
    { 
      id: 'AST003', name: 'Epson Projector', type: 'Projector', status: 'Transferred', 
      assignedTo: 'Harry Ekanayake', image: 'https://tse1.mm.bing.net/th/id/OIP.aW37fldWqaew_S4k9yOVzAHaE8?pid=Api&P=0&h=220',
      specs: '3LCD, 4000 Lumens, Full HD', category: 'Electronics', division: 'Marketing', condition: 'Good'
    },
    { 
      id: 'AST004', name: 'iPad Pro', type: 'Tablet', status: 'Maintenance', 
      assignedTo: 'Sarah Kodithuwakku', image: 'https://tse3.mm.bing.net/th/id/OIP.dIez9xu3P243rJXi3FXoUgHaFj?pid=Api&P=0&h=220',
      specs: 'Apple M2 Chip, 12.9-inch Display', category: 'Mobile', division: 'HR', condition: 'Fair'
    },
    { 
    id: 'AST005', name: 'Cisco Router 2900', type: 'Router', status: 'In Use', 
    assignedTo: 'Michael Perera', 
    image: 'https://tse3.mm.bing.net/th/id/OIP.n1PgBAsks9Nsp78Q3NvXngHaHa?pid=Api&P=0&h=220',
    specs: 'Gigabit Router, Dual WAN', category: 'Network', division: 'IT', condition: 'Excellent'
  },
  { 
    id: 'AST006', name: 'Toyota Hilux', type: 'Vehicle', status: 'Transferred', 
    assignedTo: 'Ruwan Silva', 
    image: 'https://www.carscoops.com/wp-content/uploads/2023/12/Toyota-Hilux-BEV-2048x1152.jpg',
    specs: 'Pickup Truck, Diesel Engine', category: 'Vehicles', division: 'Logistics', condition: 'Good'
  },
  { 
    id: 'AST007', name: 'Lenovo ThinkPad X1', type: 'Laptop', status: 'In Use', 
    assignedTo: 'Nimal Fernando', 
    image: 'https://tse2.mm.bing.net/th/id/OIP.UxDK5dj-x990VmILUJQEJAHaFp?pid=Api&P=0&h=220',
    specs: 'Intel Core i7, 16GB RAM, 1TB SSD', category: 'IT Equipment', division: 'IT', condition: 'Excellent'
  },
  { 
    id: 'AST008', name: 'Samsung Galaxy Tab S8', type: 'Tablet', status: 'Maintenance', 
    assignedTo: 'Amaya Jayasinghe', 
    image: 'https://tse4.mm.bing.net/th/id/OIP.gmlrBa13ph_b_WslIOzMkAHaEK?pid=Api&P=0&h=220',
    specs: 'Snapdragon 8 Gen 1, 12.4" Display', category: 'Mobile', division: 'HR', condition: 'Fair'
  }
  ]);


   

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
  /*
  viewMode: 'grid' | 'list' = 'grid';

toggleView(mode: 'grid' | 'list') {
  this.viewMode = mode;
}*/

  


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
  // UI eken values set karanna me functions ona
 showCategoryMenu = signal<boolean>(false);
  showStatusMenu = signal<boolean>(false);
  selectedAsset = signal<Asset | null>(null);

}