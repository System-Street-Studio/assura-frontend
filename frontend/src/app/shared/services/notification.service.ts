import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
  icon: string;
  referenceId?: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Notifications`;
  private notifications$ = new BehaviorSubject<AppNotification[]>([]);

  constructor() {
    this.fetchNotifications();
    // Refresh notifications every minute
    setInterval(() => this.fetchNotifications(), 60000);
  }

  fetchNotifications(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(data => {
      const mapped = data.map(n => ({
        id: n.id.toString(),
        title: n.title,
        message: n.message,
        timestamp: new Date(n.createdAt),
        read: n.isRead,
        type: (n.type?.toLowerCase() as any) || 'info',
        icon: n.icon || 'info',
        referenceId: n.referenceId
      }));
      this.notifications$.next(mapped);
    });
  }

  getAll(): Observable<AppNotification[]> {
    return this.notifications$.asObservable();
  }

  getUnreadCount(): Observable<number> {
    return this.notifications$.pipe(
      map((list: AppNotification[]) => list.filter((n: AppNotification) => !n.read).length)
    );
  }

  markAsRead(id: string): void {
    this.http.post(`${this.apiUrl}/${id}/mark-as-read`, {}).subscribe(() => {
      const updated = this.notifications$.value.map((n: AppNotification) =>
        n.id === id ? { ...n, read: true } : n
      );
      this.notifications$.next(updated);
    });
  }

  markAllAsRead(): void {
    this.http.post(`${this.apiUrl}/mark-all-as-read`, {}).subscribe(() => {
      const updated = this.notifications$.value.map((n: AppNotification) => ({ ...n, read: true }));
      this.notifications$.next(updated);
    });
  }

  formatTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }
}
