import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Product, ProductCreateRequest, ProductUpdateRequest } from '../models/product.model';
import { environment } from '../../../../environments/environment';

// The backend returns image URLs as paths relative to its own origin (e.g. "/uploads/products/x.png"),
// not the frontend's. Resolve them against the API's origin so <img> tags work outside of the dev
// proxy (which only rewrites /api and /uploads, and isn't present in a production build).
const API_ORIGIN = environment.apiUrl.replace(/\/api\/?$/, '');

function resolveImageUrl(imageUrl?: string | null): string | undefined {
  if (!imageUrl || /^https?:\/\//i.test(imageUrl)) {
    return imageUrl ?? undefined;
  }
  return `${API_ORIGIN}${imageUrl}`;
}

function withResolvedImageUrl(product: Product): Product {
  return { ...product, imageUrl: resolveImageUrl(product.imageUrl) };
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/products`;

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl).pipe(map((products) => products.map(withResolvedImageUrl)));
  }

  getById(id: number | string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`).pipe(map(withResolvedImageUrl));
  }

  create(product: ProductCreateRequest): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product).pipe(map(withResolvedImageUrl));
  }

  update(product: ProductUpdateRequest): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${product.id}`, product).pipe(map(withResolvedImageUrl));
  }

  delete(id: number | string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`);
  }

  uploadImage(id: number | string, file: File): Observable<Product> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Product>(`${this.apiUrl}/${id}/upload`, formData).pipe(map(withResolvedImageUrl));
  }
}
