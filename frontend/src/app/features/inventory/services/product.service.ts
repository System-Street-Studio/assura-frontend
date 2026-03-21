import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private products: Product[] = [
    {
      id: 'PRD-001',
      name: 'Dell XPS 13',
      manufacturer: 'Dell',
      modelNumber: 'XPS 13 9315',
      description: 'Standard issue laptop.',
    },
    {
      id: 'PRD-002',
      name: 'ThinkPad E15 G4',
      manufacturer: 'Lenovo',
      modelNumber: 'E15 Gen4 21ED',
      description: 'General office use.',
    },
  ];

  getAll(): Observable<Product[]> {
    return of(this.products);
  }

  getById(id: string): Observable<Product | undefined> {
    return of(this.products.find((p) => p.id === id));
  }

  create(product: Product): Observable<Product> {
    this.products.push(product);
    return of(product);
  }

  update(product: Product): Observable<Product> {
    const idx = this.products.findIndex((p) => p.id === product.id);
    if (idx !== -1) {
      this.products[idx] = product;
    }
    return of(product);
  }

  delete(id: string): Observable<boolean> {
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx !== -1) this.products.splice(idx, 1);
    return of(true);
  }
}
