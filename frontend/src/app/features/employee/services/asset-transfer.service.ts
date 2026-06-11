import { Injectable, inject ,signal} from '@angular/core';
import { HttpClient ,HttpParams} from '@angular/common/http';
import { Observable, of, catchError} from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/auth/auth.service';



@Injectable({ providedIn: 'root' })
export class TransferService {
    private http = inject(HttpClient);
     private baseUrl = environment.apiUrl;
    //private apiUrl = `${environment.apiUrl}/transfers`;
    // constructor(private http: HttpClient) { }
  
getTransfers(tab: string, filterType: string | null = null, employeeId: number | null = null): Observable<any[]> {
    let params = new HttpParams().set('tab', tab);

    
    if (filterType && filterType !== 'all') {
      params = params.set('filterType', filterType);
    }

    if (employeeId) {
      params = params.set('employeeId', employeeId.toString());
    }

    return this.http.get<any>(`${this.baseUrl}/transfers`, { params }).pipe(
        map(res => res.data || [])
    );
  }
  acceptTransfer(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/transfers/${id}/accept`, {});
  }

  rejectTransfer(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/transfers/${id}/reject`, {});
  }

  getTransferById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/transfers/${id}`);
  }

 
 

 
  
}
