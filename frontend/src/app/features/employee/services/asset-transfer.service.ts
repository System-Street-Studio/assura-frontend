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
  
getTransfers(tab: string, filterType: string | null = null): Observable<any[]> {
    let params = new HttpParams().set('tab', tab);

    
    if (filterType && filterType !== 'all') {
      params = params.set('filterType', filterType);
    }

    return this.http.get<any[]>(`${this.baseUrl}/transfers`, { params });
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

 // Get incoming transfers for the current user
  /*getIncomingTransfers( userId: number | null = null): Observable<any> {
    console.log('  GETTING INCOMING TRANSFERS ');
    console.log(' Fetching incoming transfers with status = 1');
    console.log(' API call: GET', `${this.baseUrl}/transfers/incoming`);
    console.log(' Query parameters:');
    console.log('  userId:', userId);
    
    let params = new HttpParams();
   
    if (userId) {
      params = params.set('userId', userId.toString());
    }
    
    return this.http.get(`${this.baseUrl}/transfers/incoming`, { params }).pipe(
      map((response: any) => {
       
        console.log(' API response received successfully');
      
        
        if (response.success && response.data) {
          
          console.log('📋 Incoming transfers:');
          response.data.forEach((transfer: any, index: number) => {
            console.log(`  ${index + 1}. ID:${transfer.id} | ${transfer.transferNumber} | Asset:${transfer.assetId} | From:${transfer.fromDivisionName} | To:${transfer.toDivisionName} | Target:${transfer.targetUserName} | Status:${transfer.status}`);
          });
          
          return response.data;
        } else {
          console.log(' No incoming transfers found or API error');
          return [];
        }
      }),
      catchError((error: any) => {
        console.log(' INCOMING TRANSFERS API ERROR ');
        
        
        return of([]);
      })
    );
  }*/
 

 
  
}
