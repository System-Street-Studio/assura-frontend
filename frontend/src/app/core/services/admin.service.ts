import { inject, Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { Observable } from "rxjs";
import { AdminStats } from "../../features/admin/models/admin-stats.model";

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private api = inject(ApiService);

    getDashboardStats(): Observable<AdminStats> {
        return this.api.get<AdminStats>('admin/dashboard-stats');
    }
}