import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Category } from '../models/category.model';
import { environment } from '../../../../environments/environment';
import { RequestCache } from '../../../core/services/request-cache';

/** Categories are master data edited only from the system-admin screens. */
const CATEGORY_TTL_MS = 10 * 60_000;

@Injectable({ providedIn: 'root' })
export class CategoryService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/categories`;

    /**
     * Nine screens load this list to populate filter and picker dropdowns. It is the same for
     * every user and changes only when an admin edits it, so it is cached for real rather than
     * refetched on each visit. Mutations below clear it immediately.
     */
    private readonly listCache = new RequestCache<Category[]>(CATEGORY_TTL_MS);

    getAll(): Observable<Category[]> {
        return this.listCache.get('all', () => this.http.get<Category[]>(this.apiUrl));
    }

    /** The last category list received, for painting a dropdown before the request settles. */
    peekAll(): Category[] | undefined {
        return this.listCache.snapshot('all');
    }

    invalidateList(): void {
        this.listCache.invalidate();
    }

    getById(id: number): Observable<Category> {
        return this.http.get<Category>(`${this.apiUrl}/${id}`);
    }

    create(category: Partial<Category>): Observable<Category> {
        return this.http.post<Category>(this.apiUrl, category).pipe(tap(() => this.invalidateList()));
    }

    update(id: number, category: Partial<Category>): Observable<Category> {
        return this.http
            .put<Category>(`${this.apiUrl}/${id}`, { id, ...category })
            .pipe(tap(() => this.invalidateList()));
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(tap(() => this.invalidateList()));
    }
}
