import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { Product, ProductCreateRequest, ProductUpdateRequest } from '../models/product.model';
import { environment } from '../../../../environments/environment';
import { RequestCache } from '../../../core/services/request-cache';

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

  /**
   * TTL is 0 because products are created, edited and deleted by users: the list is always
   * revalidated rather than replayed on a timer. The cache still pays for itself by
   * de-duplicating concurrent callers (the products page and the asset form both load it) and
   * by backing {@link peekAll}, which lets a page render before the request comes back.
   */
  private readonly listCache = new RequestCache<Product[]>(0);

  getAll(): Observable<Product[]> {
    return this.listCache.get('all', () =>
      this.http.get<Product[]>(this.apiUrl).pipe(map((products) => products.map(withResolvedImageUrl))),
    );
  }

  /** The last product list received, for painting the page before the request settles. */
  peekAll(): Product[] | undefined {
    return this.listCache.snapshot('all');
  }

  /** Drops the cached list; the next {@link getAll} refetches. */
  invalidateList(): void {
    this.listCache.invalidate();
  }

  getById(id: number | string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`).pipe(map(withResolvedImageUrl));
  }

  // Every mutation below drops the cached list so a stale snapshot is never shown after a write.

  create(product: ProductCreateRequest): Observable<Product> {
    return this.http
      .post<Product>(this.apiUrl, product)
      .pipe(map(withResolvedImageUrl), tap(() => this.invalidateList()));
  }

  update(product: ProductUpdateRequest): Observable<Product> {
    return this.http
      .put<Product>(`${this.apiUrl}/${product.id}`, product)
      .pipe(map(withResolvedImageUrl), tap(() => this.invalidateList()));
  }

  delete(id: number | string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`).pipe(tap(() => this.invalidateList()));
  }

  uploadImage(id: number | string, file: File): Observable<Product> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<Product>(`${this.apiUrl}/${id}/upload`, formData)
      .pipe(map(withResolvedImageUrl), tap(() => this.invalidateList()));
  }
}
