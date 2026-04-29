import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DebugService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;
  
  testSimpleApiCall(): Observable<any[]> {
    console.log(' Testing simple API call to assetrequests...');
    console.log(' API URL:', `${this.baseUrl}/assetrequests`);
    
    return this.http.get<any[]>(`${this.baseUrl}/assetrequests`).pipe(
      map((response) => {
        console.log(' Raw API response:', response);
        console.log(' Response type:', typeof response);
        console.log(' Response length:', response?.length);
        console.log(' Response is array:', Array.isArray(response));
        
        if (response && response.length > 0) {
          console.log(' First item structure:', response[0]);
          console.log(' Available fields:', Object.keys(response[0]));
          
          // Look for transfer requests
          const transferRequests = response.filter(item => {
            const type = item.requestType || item.type || item.RequestType;
            const status = item.status || item.Status || item.requestStatus;
            console.log(` Item ${item.id}: type="${type}", status="${status}"`);
            return type === 'Transfer' && status === 'Approved';
          });
          
          console.log(' Found transfer requests:', transferRequests.length);
          console.log(' Transfer request samples:', transferRequests.slice(0, 2));
        }
        
        return response;
      })
    );
  }

 

  // Test if asset endpoints exist
  testAssetEndpoints(): Observable<any> {
    console.log(' Testing asset endpoints...');
    
    // Test basic asset list endpoint
    return this.http.get(`${this.baseUrl}/assets`).pipe(
      tap(() => {
        console.log(' Asset list endpoint exists: /api/assets');
      }),
      catchError((error) => {
        console.error(' Asset list endpoint not found:', error);
        
        // Try alternative endpoint
        return this.http.get(`${this.baseUrl}/asset`).pipe(
          tap(() => {
            console.log(' Alternative asset endpoint exists: /api/asset');
          }),
          catchError((altError) => {
            console.error(' No asset endpoints found');
            console.error(' Tried: /api/assets and /api/asset');
            return throwError(() => altError);
          })
        );
      })
    );
  }
}