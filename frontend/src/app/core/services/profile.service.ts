import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserProfile, UpdateProfileRequest } from '../../features/profile/models/profile.models';

@Injectable({
    providedIn: 'root'
})
export class ProfileService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/users/profile`;

    // Cache using signals
    private _profile = signal<UserProfile | null>(null);
    public readonly profile = computed(() => this._profile());
    public readonly loading = signal<boolean>(false);

    getProfile(forceRefresh = false): Observable<UserProfile> {
        // Return from cache if available and not forced
        const currentProfile = this._profile();
        if (currentProfile && !forceRefresh) {
            return new Observable<UserProfile>(observer => {
                observer.next(currentProfile);
                observer.complete();
            });
        }

        this.loading.set(true);
        return this.http.get<UserProfile>(this.apiUrl).pipe(
            tap({
                next: (profile) => {
                    this._profile.set(profile);
                    this.loading.set(false);
                },
                error: () => this.loading.set(false)
            })
        );
    }

    updateProfile(request: UpdateProfileRequest): Observable<void> {
        return this.http.put<void>(this.apiUrl, request).pipe(
            tap(() => {
                // Optimistically update or just clear cache to refetch
                // For simplicity, we'll just refresh the full profile after update
                this.getProfile(true).subscribe();
            })
        );
    }

    clearCache(): void {
        this._profile.set(null);
    }
}
