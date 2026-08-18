import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

// TODO: Implement API service methods
// - Generic GET, POST, PUT, DELETE wrappers
// - Error handling
// - Response mapping

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiUrl;
  private http = inject(HttpClient);


  get<T>(endpoint: string): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    console.log(`[DEBUG] ApiService: GET ${url}`);
    return this.http.get<T>(url).pipe(
      tap({
        next: (data: any) => console.log(`[DEBUG] ApiService: GET ${url} success`, data),
        error: (err: any) => console.error(`[DEBUG] ApiService: GET ${url} error`, err)
      })
    );
  }

  post<T>(endpoint: string, body: unknown): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    console.log(`[DEBUG] ApiService: POST ${url}`, body);
    return this.http.post<T>(url, body);
  }

  put<T>(endpoint: string, body: unknown): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    console.log(`[DEBUG] ApiService: PUT ${url}`, body);
    return this.http.put<T>(url, body);
  }

  delete<T>(endpoint: string): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    console.log(`[DEBUG] ApiService: DELETE ${url}`);
    return this.http.delete<T>(url);
  }

  patch<T>(endpoint: string, body: unknown): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    console.log(`[DEBUG] ApiService: PATCH ${url}`, body);
    return this.http.patch<T>(url, body);
  }
}
