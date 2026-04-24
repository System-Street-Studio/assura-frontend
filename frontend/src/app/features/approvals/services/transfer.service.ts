import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';

/*@Injectable({ providedIn: 'root' })
port class TransferService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Transfers`;

  

}*/