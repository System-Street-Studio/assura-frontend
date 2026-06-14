import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';


export interface PoolAsset {
  id: number;
  productName: string;
  assetCode: string;
  assetTag: string;
  categoryId: number;
  categoryName: string;
  assignedUserId?: number;
  assignedUserName?: string;
  divisionName: string;
  status: string;
  notes?: string;
  serialNumber?: string;
  specifications?: string;
}


export interface AssignedEmployee {
  id: number;
  name: string;
}

export interface AssignedDivision {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface AssetSpecification {
  id: number;
  name: string;
  categoryId: number;
  categoryName?: string;
}

@Injectable({ providedIn: 'root' })
export class AssetPoolService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl; 

 
  getFilteredAssets(filters: any): Observable<any> {
    let params = new HttpParams();

    // Add optional filter parameters only if they exist in filters object
    if (filters.search) {
      params = params.set('search', filters.search);
      console.log(' Adding search:', filters.search);
    }
    if (filters.category) {
      params = params.set('category', filters.category);
      console.log(' Adding category:', filters.category);
    }
    if (filters.division) {
      params = params.set('division', filters.division);
      console.log(' Adding division:', filters.division);
    }
    if (filters.employeeId) {
      params = params.set('employeeId', filters.employeeId);
      console.log(' Adding employeeId:', filters.employeeId);
    }
    if (filters.specName) {
      params = params.set('specName', filters.specName);
      console.log(' Adding specName:', filters.specName);
    }
    if (filters.specValue) {
      params = params.set('specValue', filters.specValue);
      console.log(' Adding specValue:', filters.specValue);
    }
    if (filters.page) {
      params = params.set('page', filters.page.toString());
    }
    if (filters.pageSize) {
      params = params.set('pageSize', filters.pageSize.toString());
    }

    
    return this.http.get<any>(this.baseUrl + '/asset-pool', { params });
  }

  

  
   /* Backend filters employees who have assigned assets
   */
  getAssignedEmployees(): Observable<AssignedEmployee[]> {
    return this.http.get<AssignedEmployee[]>(`${this.baseUrl}/asset-pool/employees`);
  }

  
   /* Backend filters divisions that contain assigned assets
   */
  getAssignedDivisions(): Observable<AssignedDivision[]> {
    return this.http.get<AssignedDivision[]>(`${this.baseUrl}/asset-pool/divisions`);
  }

   /* Get all categories for filtering
   */
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories`);
  }


   /* Get asset specifications by category ID
   */
  getSpecificationsByCategory(categoryId: number): Observable<AssetSpecification[]> {
    return this.http.get<AssetSpecification[]>(`${this.baseUrl}/assetspecifications/category/${categoryId}`);
  }

  /**
   * Get asset specifications by category name
   */
  getSpecificationsByCategoryName(categoryName: string): Observable<AssetSpecification[]> {
    return this.http.get<AssetSpecification[]>(`${this.baseUrl}/assetspecifications/categoryname/${categoryName}`);
  }

  
 
}