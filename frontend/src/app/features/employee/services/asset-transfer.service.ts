import { Injectable, inject ,signal} from '@angular/core';
import { HttpClient ,HttpParams} from '@angular/common/http';
import { Observable, of, catchError} from 'rxjs';
import { environment } from '../../../../environments/environment';



@Injectable({ providedIn: 'root' })
export class EmployeeTransferService {
    private http = inject(HttpClient);
     private baseUrl = environment.apiUrl;
   
  // get transfer records for the logged-in employee
  getTransfers(tab: string, filterType: string | null = null): Observable<any[]> {
    let params = new HttpParams().set('tab', tab);

    
    if (filterType && filterType !== 'all') {
      params = params.set('filterType', filterType);
    }

    return this.http.get<any[]>(`${this.baseUrl}/transfers`, { params });
  }

  //accept transfer by employee
  acceptTransfer(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/transfers/${id}/accept`, {});
  }

  //reject transfer by employee
  rejectTransfer(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/transfers/${id}/reject`, {});
  }

  //get transfer details by ID
  getTransferById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/transfers/${id}`);
  }

  //return transfer by employee
   returnActiveTransfer(transferId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/transfers/${transferId}/return`, {});
  }

  //get transfer counts for the logged-in employee (caller is derived from the JWT server-side)
  getTransferCounts(): Observable<any> {
  return this.http.get<any>(`${this.baseUrl}/transfers/counts`);
  }
  
}
