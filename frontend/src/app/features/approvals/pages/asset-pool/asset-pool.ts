import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

interface Asset {
  id: number;
  name: string;
  brand: string;
  assignedTo: string;
  empId: string;
  division: string;
  category: string;
  specifications: string;
}

interface CategoryConfig {
  brands: string[];
  specifications: string[];
}

@Component({
  selector: 'app-asset-pool',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './asset-pool.html',
  styleUrl: './asset-pool.css'
})
export class AssetPoolComponent {
  private router = inject(Router);

  // Category to Brand mapping
  categoryBrandMap: Record<string, CategoryConfig> = {
    'Electronics': {
      brands: ['Dell', 'HP', 'Lenovo', 'Apple'],
      specifications: ['size', 'weight', 'resolution', 'processor']
    },
    'Furniture': {
      brands: ['IKEA', 'Herman Miller', 'Steelcase', 'Hon'],
      specifications: ['dimensions', 'material', 'color', 'capacity']
    },
    'Vehicles': {
      brands: ['Toyota', 'Honda', 'BMW', 'Mercedes'],
      specifications: ['year', 'mileage', 'type', 'engine']
    },
    'Office Equipment': {
      brands: ['Xerox', 'Canon', 'Brother', 'HP'],
      specifications: ['model', 'type', 'speed', 'capacity']
    }
  };

  // Divisions list
  divisions = signal(['IT', 'Finance', 'HR', 'Operations', 'Marketing', 'Sales']);

  // Filters signals
  searchQuery = signal('');
  selectedCategory = signal('Electronics');
  selectedBrand = signal('');
  selectedDivision = signal('');
  selectedEmployee = signal('');
  selectedSpecification = signal('');
  specificationValue = signal('');

  // Master Data List
  allAssets = signal<Asset[]>([
    // Electronics
    { id: 1, name: 'Laptop', brand: 'Dell', assignedTo: 'Jenny Athapaththu', empId: 'EST001', division: 'IT', category: 'Electronics', specifications: '32 × 22 × 1.8 cm' },
    { id: 2, name: 'Laptop', brand: 'Dell', assignedTo: 'Harry Ekanayeke', empId: 'EST002', division: 'Finance', category: 'Electronics', specifications: '30 × 20 × 1.5 cm' },
    { id: 3, name: 'Monitor', brand: 'Dell', assignedTo: 'Sarah Kodithuwakku', empId: 'EST003', division: 'HR', category: 'Electronics', specifications: '61 × 50 × 20 cm' },
    { id: 4, name: 'Laptop', brand: 'Dell', assignedTo: 'Seleena Fernando', empId: 'EST004', division: 'IT', category: 'Electronics', specifications: '32 × 22 × 1.8 cm' },
    { id: 5, name: 'Keyboard', brand: 'HP', assignedTo: 'John Silva', empId: 'EST005', division: 'Operations', category: 'Electronics', specifications: '45 × 15 × 2 cm' },
    { id: 6, name: 'Mouse', brand: 'Lenovo', assignedTo: 'Maria Garcia', empId: 'EST006', division: 'Marketing', category: 'Electronics', specifications: '10 × 7 × 3 cm' },
    // Furniture
    { id: 7, name: 'Office Chair', brand: 'Herman Miller', assignedTo: 'Robert Brown', empId: 'EST007', division: 'Sales', category: 'Furniture', specifications: '65 × 65 × 110 cm' },
    { id: 8, name: 'Desk', brand: 'IKEA', assignedTo: 'Anna White', empId: 'EST008', division: 'IT', category: 'Furniture', specifications: '120 × 60 × 75 cm' },
    { id: 9, name: 'Cabinet', brand: 'Steelcase', assignedTo: 'David Lee', empId: 'EST009', division: 'Finance', category: 'Furniture', specifications: '90 × 45 × 180 cm' },
    // Vehicles
    { id: 10, name: 'Car', brand: 'Toyota', assignedTo: 'Michael Johnson', empId: 'EST010', division: 'Operations', category: 'Vehicles', specifications: '2022 Model' },
    { id: 11, name: 'Van', brand: 'Honda', assignedTo: 'Patricia Davis', empId: 'EST011', division: 'Operations', category: 'Vehicles', specifications: '2021 Model' },
    // Office Equipment
    { id: 12, name: 'Printer', brand: 'Xerox', assignedTo: 'James Wilson', empId: 'EST012', division: 'HR', category: 'Office Equipment', specifications: 'A4 - Color' },
    { id: 13, name: 'Copier', brand: 'Canon', assignedTo: 'Linda Martinez', empId: 'EST013', division: 'Finance', category: 'Office Equipment', specifications: 'A3 - Multifunction' }
  ]);

  // Computed signals
  availableBrands = computed(() => {
    const config = this.categoryBrandMap[this.selectedCategory()];
    return config ? config.brands : [];
  });

  availableSpecifications = computed(() => {
    const config = this.categoryBrandMap[this.selectedCategory()];
    return config ? config.specifications : [];
  });

  filteredAssets = computed(() => {
    let filtered = this.allAssets();

    // Filter by search query (name, empId, assignedTo)
    const q = this.searchQuery().toLowerCase();
    if (q) {
      filtered = filtered.filter(asset =>
        asset.name.toLowerCase().includes(q) ||
        asset.empId.toLowerCase().includes(q) ||
        asset.assignedTo.toLowerCase().includes(q)
      );
    }

    // Filter by category
    filtered = filtered.filter(asset => asset.category === this.selectedCategory());

    // Filter by brand
    if (this.selectedBrand()) {
      filtered = filtered.filter(asset => asset.brand === this.selectedBrand());
    }

    // Filter by division
    if (this.selectedDivision()) {
      filtered = filtered.filter(asset => asset.division === this.selectedDivision());
    }

    // Filter by employee
    if (this.selectedEmployee()) {
      filtered = filtered.filter(asset =>
        asset.empId.toLowerCase().includes(this.selectedEmployee().toLowerCase()) ||
        asset.assignedTo.toLowerCase().includes(this.selectedEmployee().toLowerCase())
      );
    }

    return filtered;
  });

  // Get unique employees for the current filtered context
  uniqueEmployees = computed(() => {
    const employees = this.allAssets().map(a => ({ name: a.assignedTo, id: a.empId }));
    const unique = Array.from(
      new Map(employees.map(e => [e.id, e])).values()
    );
    return unique;
  });

  onCategoryChange(category: string) {
    this.selectedCategory.set(category);
    this.selectedBrand.set('');
    this.selectedSpecification.set('');
    this.specificationValue.set('');
  }

  putTransferRequest(asset: Asset) {
    console.log('Transfer requested for:', asset);
    // TODO: Navigate to transfer page or show modal to create transfer request
    alert(`Transfer request initiated for ${asset.name} assigned to ${asset.assignedTo}`);
  }
}