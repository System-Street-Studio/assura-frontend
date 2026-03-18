import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
  icon: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notifications$ = new BehaviorSubject<AppNotification[]>([
    {
      id: '1',
      title: 'New Asset Assigned',
      message: 'You have been assigned a new asset: Dell XPS 13.',
      timestamp: new Date(Date.now() - 10 * 60_000),
      read: false,
      type: 'info',
      icon: 'exit_to_app',
    },
    {
      id: '2',
      title: 'Transfer Request Approved',
      message: 'Your transfer request for MacBook Pro is approved.',
      timestamp: new Date(Date.now() - 45 * 60_000),
      read: false,
      type: 'info',
      icon: 'swap_horiz',
    },
    {
      id: '3',
      title: 'Maintenance Complete',
      message: 'ThinkPad E15 G4 repair has been completed.',
      timestamp: new Date(Date.now() - 3 * 3_600_000),
      read: false,
      type: 'success',
      icon: 'build',
    },
    {
      id: '4',
      title: 'New Asset Request',
      message: 'Richard K. Cornejo requested a laptop.',
      timestamp: new Date(Date.now() - 6 * 3_600_000),
      read: true,
      type: 'info',
      icon: 'swap_horiz',
    },
    {
      id: '5',
      title: 'Asset Checked Out',
      message: 'XPS 13" was checked out to Elliott Nolan.',
      timestamp: new Date(Date.now() - 10 * 60_000),
      read: false,
      type: 'info',
      icon: 'exit_to_app',
    },
    {
      id: '6',
      title: 'Warranty Expiring',
      message: 'iPhone 15 Pro Max warranty expires in 7 days.',
      timestamp: new Date(Date.now() - 45 * 60_000),
      read: false,
      type: 'warning',
      icon: 'schedule',
    },
    {
      id: '7',
      title: 'Audit Scheduled',
      message: 'Quarterly audit starts next Monday.',
      timestamp: new Date(Date.now() - 24 * 3_600_000),
      read: true,
      type: 'info',
      icon: 'fact_check',
    },
  ]);

  getAll(): Observable<AppNotification[]> {
    return this.notifications$.asObservable();
  }

  getUnreadCount(): Observable<number> {
    return this.notifications$.pipe(
      map((list: AppNotification[]) => list.filter((n: AppNotification) => !n.read).length)
    );
  }

  markAsRead(id: string): void {
    const updated = this.notifications$.value.map((n: AppNotification) =>
      n.id === id ? { ...n, read: true } : n
    );
    this.notifications$.next(updated);
  }

  markAllAsRead(): void {
    const updated = this.notifications$.value.map((n: AppNotification) => ({ ...n, read: true }));
    this.notifications$.next(updated);
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
